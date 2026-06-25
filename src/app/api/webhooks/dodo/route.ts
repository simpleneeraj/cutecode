import { Webhooks } from "@dodopayments/nextjs";
import { WebhookService } from "@/lib/billing/webhook-service";
import { logger } from "@/lib/logger";

// ─── Shared Event Processor ──────────────────────────────────────────────────

/**
 * Store → Process pipeline. Store-first guarantees no event loss and idempotent
 * dedup; processing dispatches subscription events to BillingService.
 */
async function processWebhookEvent(payload: any) {
  const data = payload.data || payload;

  // Build a STABLE fallback event ID — never include Date.now() or any
  // timestamp here, or every Dodo retry would look like a brand-new event and
  // bypass idempotency.
  const eventId =
    data.event_id ??
    payload.id ??
    payload.eventId ??
    `fallback_${data.subscription_id ?? "unknown"}`;

  const eventType = payload.type ?? payload.event_type ?? data.type ?? "unknown";

  const isNew = await WebhookService.store(eventId, eventType, payload);
  if (!isNew) return; // duplicate delivery — exit idempotently

  try {
    await WebhookService.process(eventId);
  } catch (err) {
    logger.error({ err, eventId }, `[webhook] Processing failed for ${eventId}`);
    throw err;
  }
}

// ─── Route Handler ─────────────────────────────────────────────────────────────

/**
 * POST /api/webhooks/dodo
 *
 * Lean billing: only subscription lifecycle events drive plan state. Payment,
 * refund, and dispute events are not handled here (Dodo dashboard is the system
 * of record for transactions).
 */
export const POST = Webhooks({
  webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY!,

  onSubscriptionActive: processWebhookEvent,
  onSubscriptionOnHold: processWebhookEvent,
  onSubscriptionRenewed: processWebhookEvent,
  onSubscriptionPlanChanged: processWebhookEvent,
  onSubscriptionCancelled: processWebhookEvent,
  onSubscriptionFailed: processWebhookEvent,
  onSubscriptionExpired: processWebhookEvent,
});
