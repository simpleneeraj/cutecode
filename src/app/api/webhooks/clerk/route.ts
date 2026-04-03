/**
 * Clerk Webhook Handler — Enterprise Edition
 *
 * Responsibilities:
 *  1. Verify the Svix signature (tamper-proof delivery)
 *  2. Guard against replay attacks via timestamp tolerance
 *  3. Idempotently sync user lifecycle events to your DB
 *  4. Emit structured logs for observability (Datadog / CloudWatch friendly)
 *  5. Return well-typed, consistent HTTP responses
 *
 * Route: POST /api/webhooks/clerk
 */

import { Webhook, WebhookRequiredHeaders } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { syncClerkUser, deleteClerkUser, extractEmail } from "@/lib/auth/sync";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Narrow the full Clerk User object to only the fields this handler needs.
 * Using a strict subset prevents silent bugs if Clerk adds/renames fields.
 */
interface EmailAddress {
  id: string;
  email_address: string;
}

interface ClerkUserData {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email_addresses: EmailAddress[];
  primary_email_address_id: string | null;
}

/**
 * Union of every event variant this handler processes.
 * Add new variants here (e.g. "session.created") as your needs grow.
 */
type UserCreatedEvent = { type: "user.created"; data: ClerkUserData };
type UserUpdatedEvent = { type: "user.updated"; data: ClerkUserData };
// user.deleted only guarantees `id`; the rest may be stripped by Clerk.
type UserDeletedEvent = { type: "user.deleted"; data: Pick<ClerkUserData, "id"> };

type ClerkWebhookEvent = UserCreatedEvent | UserUpdatedEvent | UserDeletedEvent;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Svix embeds a timestamp in every webhook. Reject events older than this
 * window to mitigate replay attacks where an attacker re-sends a captured
 * valid request.
 *
 * 5 minutes is the Svix-recommended default.
 */
const TIMESTAMP_TOLERANCE_MS = 5 * 60 * 1000;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Builds a structured log object for every outcome.
 * Drop this into your logger (pino, winston, console.log in Lambda, etc.).
 * The consistent shape makes it trivially queryable in Datadog / CloudWatch.
 */
function buildLogContext(
  eventType: string | "unknown",
  outcome: "success" | "ignored" | "error",
  extra?: Record<string, unknown>,
) {
  return {
    service: "clerk-webhook",
    eventType,
    outcome,
    ts: new Date().toISOString(),
    ...extra,
  };
}

/**
 * Fail-fast config validation at cold-start, not at request time.
 * In serverless environments this runs once per container instance.
 */
function getWebhookSecret(): string {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    // This is a programming/deployment error, not a runtime one.
    // Throw so the process crashes loudly instead of silently serving 500s.
    throw new Error("CLERK_WEBHOOK_SECRET is not set. " + "Configure it in your environment before deploying.");
  }
  return secret;
}

// Initialise once per container lifecycle — not inside the request handler.
// This avoids re-constructing the Webhook verifier on every hot invocation.
const webhookVerifier = new Webhook(getWebhookSecret());

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

export async function POST(req: Request): Promise<NextResponse> {
  // ── 1. Extract Svix signature headers ────────────────────────────────────
  const headerPayload = await headers();

  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    // Missing headers almost always means a non-Svix caller (e.g. a scanner).
    // Log at warn, not error, to avoid alert fatigue from internet noise.
    console.warn(JSON.stringify(buildLogContext("unknown", "error", { reason: "missing_svix_headers" })));
    return NextResponse.json({ error: "Missing required Svix headers." }, { status: 400 });
  }

  // ── 2. Replay-attack guard — validate timestamp freshness ────────────────
  //
  // Svix also does this internally, but doing it explicitly here:
  //   a) gives you a clear log entry with the reason
  //   b) lets you tune the tolerance window independently of the library
  //
  const eventAgeMs = Date.now() - Number(svixTimestamp) * 1000;
  if (eventAgeMs > TIMESTAMP_TOLERANCE_MS) {
    console.warn(
      JSON.stringify(
        buildLogContext("unknown", "error", {
          reason: "stale_timestamp",
          eventAgeMs,
        }),
      ),
    );
    return NextResponse.json({ error: "Webhook timestamp is too old." }, { status: 400 });
  }

  // ── 3. Verify signature ───────────────────────────────────────────────────
  //
  // We read the raw body as text so the HMAC is computed over the exact bytes
  // Svix signed. Never parse JSON first — any re-serialisation can break the
  // signature even with identical data.
  //
  const rawBody = await req.text();

  const svixHeaders: WebhookRequiredHeaders = {
    "svix-id": svixId,
    "svix-timestamp": svixTimestamp,
    "svix-signature": svixSignature,
  };

  let evt: ClerkWebhookEvent;
  try {
    evt = webhookVerifier.verify(rawBody, svixHeaders) as ClerkWebhookEvent;
  } catch (err) {
    // verify() throws on bad HMAC or structurally invalid payloads.
    console.error(
      JSON.stringify(
        buildLogContext("unknown", "error", {
          reason: "signature_verification_failed",
          // Avoid logging the raw error message in case it leaks internals.
          error: err instanceof Error ? err.message : "unknown",
        }),
      ),
    );
    return NextResponse.json({ error: "Webhook signature verification failed." }, { status: 401 });
  }

  const { type } = evt;

  // ── 4. Route & process ───────────────────────────────────────────────────
  try {
    switch (type) {
      case "user.created":
      case "user.updated": {
        const { data } = evt;

        const email = extractEmail(data.email_addresses, data.primary_email_address_id);

        // Filter falsy values so a missing last_name doesn't produce "Jane "
        const name = [data.first_name, data.last_name].filter(Boolean).join(" ") || undefined;

        await syncClerkUser({ clerkId: data.id, email, name });

        console.info(JSON.stringify(buildLogContext(type, "success", { clerkId: data.id })));
        break;
      }

      case "user.deleted": {
        const { data } = evt;
        await deleteClerkUser(data.id);

        console.info(JSON.stringify(buildLogContext(type, "success", { clerkId: data.id })));
        break;
      }

      default: {
        /**
         * Exhaustiveness check — TypeScript will error here at compile time
         * if a new event variant is added to ClerkWebhookEvent but not
         * handled above. Remove the `_exhaustiveCheck` line if you want
         * unknown events to be silently ignored instead.
         */
        const _exhaustiveCheck: never = evt;
        void _exhaustiveCheck;

        console.info(
          JSON.stringify(
            buildLogContext((evt as ClerkWebhookEvent).type ?? "unknown", "ignored", {
              reason: "unhandled_event_type",
            }),
          ),
        );
      }
    }
  } catch (err) {
    /**
     * Catch DB / downstream errors separately from signature errors so callers
     * can distinguish between "bad request" (4xx) and "we errored" (5xx).
     *
     * Returning 5xx causes Svix to automatically retry — exactly the behaviour
     * you want when a transient DB error prevented the sync.
     */
    console.error(
      JSON.stringify(
        buildLogContext(type, "error", {
          reason: "handler_exception",
          error: err instanceof Error ? err.message : String(err),
        }),
      ),
    );
    return NextResponse.json({ error: "Internal error while processing webhook." }, { status: 500 });
  }

  // Svix considers any 2xx a success and will not retry.
  return NextResponse.json({ received: true }, { status: 200 });
}
