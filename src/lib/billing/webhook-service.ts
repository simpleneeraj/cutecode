import { prisma } from "@/lib/db";
import { BillingService } from "@/lib/billing/service";
import { SubscriptionStatus } from "@/generated/prisma/enums";
import { logger } from "@/lib/logger";

// ─── Types ────────────────────────────────────────────────────────────────────

type DodoPayload = {
  data: {
    subscription_id: string;
    event_id?: string;
    event_seq?: number;
    product_id?: string;
    customer: { email: string; customer_id?: string };
    current_period_start?: string;
    current_period_end?: string;
  };
};

// ─── Event → SubscriptionStatus mapping ──────────────────────────────────────

const SUBSCRIPTION_STATUS_MAP: Record<string, SubscriptionStatus> = {
  "subscription.active": SubscriptionStatus.ACTIVE,
  "subscription.renewed": SubscriptionStatus.ACTIVE,
  "subscription.plan_changed": SubscriptionStatus.ACTIVE,
  "subscription.trialing": SubscriptionStatus.TRIALING,
  "subscription.on_hold": SubscriptionStatus.PAST_DUE,
  "subscription.cancelled": SubscriptionStatus.CANCELED,
  "subscription.failed": SubscriptionStatus.PAST_DUE,
  "subscription.expired": SubscriptionStatus.EXPIRED,
};

// ─── WebhookService ───────────────────────────────────────────────────────────

/**
 * WebhookService — store-first, idempotent subscription webhook dispatcher.
 *
 * Flow:
 * 1. store()   — write raw event to DB; returns false if duplicate
 * 2. process() — load stored event, dispatch to BillingService, mark processed
 *
 * Lean scope: only subscription lifecycle events drive plan state. Payment,
 * refund, and dispute records are not persisted — Dodo's dashboard is the
 * system of record for transactions.
 */
export class WebhookService {
  /**
   * Store the raw inbound webhook event.
   * Returns true for new events, false for duplicates (P2002).
   */
  static async store(eventId: string, type: string, rawPayload: unknown): Promise<boolean> {
    try {
      await prisma.webhookEvent.create({
        data: { id: eventId, type, rawPayload: rawPayload as object },
      });
      return true;
    } catch (err: unknown) {
      const e = err as { code?: string };
      if (e.code === "P2002") return false; // duplicate
      throw err;
    }
  }

  /**
   * Process a stored event by its event_id. Idempotent: already-processed
   * events are skipped.
   */
  static async process(eventId: string): Promise<void> {
    const event = await prisma.webhookEvent.findUnique({ where: { id: eventId } });

    if (!event) throw new Error(`[WebhookService] Event not found: ${eventId}`);
    if (event.processedAt !== null) return; // already processed

    await WebhookService.dispatch(event.type, event.rawPayload as DodoPayload);

    await prisma.webhookEvent.update({
      where: { id: eventId },
      data: { processedAt: new Date() },
    });
  }

  // ── Internal Dispatch ────────────────────────────────────────────────────

  private static async dispatch(type: string, payload: DodoPayload): Promise<void> {
    const mappedStatus = SUBSCRIPTION_STATUS_MAP[type];

    if (!mappedStatus) {
      // Non-subscription events (payments, refunds, disputes) are acknowledged
      // but not persisted in the lean billing model.
      logger.info({ type }, `[WebhookService] Ignoring non-subscription event`);
      return;
    }

    const { data } = payload;
    await BillingService.applySubscriptionEvent({
      dodoSubscriptionId: data.subscription_id,
      dodoCustomerId: data.customer?.customer_id,
      customerEmail: data.customer.email,
      productId: data.product_id,
      newStatus: mappedStatus,
      periodStart: data.current_period_start ? new Date(data.current_period_start) : new Date(),
      periodEnd: data.current_period_end ? new Date(data.current_period_end) : new Date(),
      eventSeq: data.event_seq,
      eventId: data.event_id ?? `${data.subscription_id}_${Date.now()}`,
    });
  }
}
