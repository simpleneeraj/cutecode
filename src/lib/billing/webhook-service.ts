import { prisma } from "@/lib/db";
import { BillingService } from "@/lib/billing/service";
import { SubscriptionStatus, PaymentStatus } from "@/generated/prisma/enums";
import { logger } from "@/lib/logger";

// ─── Types ────────────────────────────────────────────────────────────────────

type DodoPayload = {
  data: {
    subscription_id: string;
    payment_id: string;
    event_id?: string;
    event_seq?: number;
    product_id?: string;
    amount?: number;
    currency?: string;
    refund_amount?: number;
    refund_reason?: string;
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

const SUBSCRIPTION_EVENT_TYPES = new Set(Object.keys(SUBSCRIPTION_STATUS_MAP));

// ─── WebhookService ───────────────────────────────────────────────────────────

/**
 * WebhookService — store-first, idempotent webhook dispatcher.
 *
 * Flow:
 * 1. store()   — write raw event to DB; returns false if duplicate
 * 2. process() — load stored event, dispatch to BillingService, update status
 * 3. retryFailed() — called by cron, retries FAILED events with exponential backoff
 *
 * Guarantees:
 * - Same event_id arriving twice is always a no-op after the first store
 * - Processing failure leaves event in FAILED state for cron retry
 * - Concurrent calls to process() for same event are safe (idempotent handler)
 */
export class WebhookService {
  /**
   * Store the raw inbound webhook event.
   * MUST be called before returning 200 to DodoPayments.
   * Returns true for new events, false for duplicates (P2002).
   */
  static async store(eventId: string, type: string, rawPayload: unknown): Promise<boolean> {
    try {
      await prisma.webhookEvent.create({
        data: {
          id: eventId,
          type,
          rawPayload: rawPayload as object,
        },
      });
      return true;
    } catch (err: unknown) {
      const e = err as { code?: string };
      if (e.code === "P2002") return false; // duplicate
      throw err;
    }
  }

  /**
   * Process a stored event by its event_id.
   * Idempotent: SUCCEEDED events are skipped without re-processing.
   */
  static async process(eventId: string): Promise<void> {
    const event = await prisma.webhookEvent.findUnique({ where: { id: eventId } });

    if (!event) throw new Error(`[WebhookService] Event not found: ${eventId}`);
    if (event.processedAt !== null) return; // already succeeded

    // Mark as in-progress and increment attempt counter
    await prisma.webhookEvent.update({
      where: { id: eventId },
      data: {
        attempts: { increment: 1 },
        lastAttemptAt: new Date(),
      },
    });

    try {
      await WebhookService.dispatch(event.type, event.rawPayload as DodoPayload);

      await prisma.webhookEvent.update({
        where: { id: eventId },
        data: {
          processedAt: new Date(),
          errorMessage: null,
        },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);

      await prisma.webhookEvent.update({
        where: { id: eventId },
        data: { errorMessage: message },
      });

      throw err;
    }
  }

  /**
   * Retry FAILED events eligible for another attempt (exponential backoff).
   * Called by the billing cron. Max 5 attempts total.
   * Returns number of events successfully retried.
   */
  static async retryFailed(): Promise<number> {
    const MAX_ATTEMPTS = 5;
    const now = new Date();
    let retried = 0;

    // Events that have failed and still have attempts remaining
    const candidates = await prisma.webhookEvent.findMany({
      where: {
        processedAt: null,
        attempts: { gt: 0, lt: MAX_ATTEMPTS },
        errorMessage: { not: null },
      },
    });

    for (const event of candidates) {
      // Exponential backoff: 1m, 5m, 25m, 125m, 625m
      const backoffMs = Math.pow(5, event.attempts - 1) * 60_000;
      const earliestRetry = new Date((event.lastAttemptAt?.getTime() ?? 0) + backoffMs);

      if (earliestRetry > now) continue;

      try {
        await WebhookService.process(event.id);
        retried++;
      } catch {
        // Stays failed — retried again on next cron run
      }
    }

    return retried;
  }

  // ── Internal Dispatch ────────────────────────────────────────────────────

  private static async dispatch(type: string, payload: DodoPayload): Promise<void> {
    const { data } = payload;

    if (SUBSCRIPTION_EVENT_TYPES.has(type)) {
      const mappedStatus = SUBSCRIPTION_STATUS_MAP[type];
      if (!mappedStatus) return;

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
    } else if (type === "payment.succeeded") {
      const userId = await WebhookService.resolveUserId(data.customer.email);
      await BillingService.recordPayment({
        userId,
        dodoPaymentId: data.payment_id,
        idempotencyKey: `success_${data.payment_id}`,
        amount: data.amount ?? 0,
        currency: data.currency ?? "USD",
        status: PaymentStatus.SUCCEEDED,
        subscriptionId: data.subscription_id ?? null,
      });
    } else if (type === "payment.failed" || type === "payment.cancelled") {
      const userId = await WebhookService.resolveUserId(data.customer.email);
      await BillingService.recordPayment({
        userId,
        dodoPaymentId: data.payment_id,
        idempotencyKey: `failed_${data.payment_id}`,
        amount: data.amount ?? 0,
        currency: data.currency ?? "USD",
        status: PaymentStatus.FAILED,
        subscriptionId: data.subscription_id ?? null,
      });
    } else if (type === "refund.succeeded") {
      await BillingService.applyRefund({
        dodoPaymentId: data.payment_id,
        refundAmount: data.refund_amount ?? 0,
        refundReason: data.refund_reason,
      });
    } else if (type.startsWith("dispute.")) {
      // dispute.opened, dispute.accepted, dispute.lost -> DISPUTED
      // dispute.won, dispute.cancelled -> SUCCEEDED
      // dispute.expired -> SUCCEEDED
      const isDisputed = ["dispute.opened", "dispute.accepted", "dispute.lost", "dispute.challenged"].includes(type);
      const isWon = ["dispute.won", "dispute.cancelled", "dispute.expired"].includes(type);

      const newStatus = isDisputed ? PaymentStatus.DISPUTED : isWon ? PaymentStatus.SUCCEEDED : PaymentStatus.DISPUTED;

      // We expect the payment to exist
      if (data.payment_id) {
        // Assume dispute_id exists on payload.data if it's a dispute event
        await BillingService.updateDispute(data.payment_id, newStatus, (data as any).dispute_id);
      }
    } else {
      // Forward-compatible: log but don't fail for unknown event types
      logger.info({ type }, `[WebhookService] Unhandled event type`);
    }
  }

  private static async resolveUserId(email: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (!user) throw new Error(`[WebhookService] No user for email: ${email}`);
    return user.id;
  }
}
