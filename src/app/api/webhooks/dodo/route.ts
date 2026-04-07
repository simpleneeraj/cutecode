import { NextRequest, NextResponse } from "next/server";
import { Webhooks } from "@dodopayments/nextjs";
import { WebhookService } from "@/lib/billing/webhook-service";
import { AuditLogger } from "@/lib/billing/audit";
import { AuditAction } from "@/generated/prisma/enums";
import { logger } from "@/lib/logger";

// ─── Shared Event Processor ──────────────────────────────────────────────────

/**
 * Standardizes the webhook pipeline: Store → Audit → Process.
 * Ensures idempotency and error tracking across all event cases.
 */
async function processWebhookEvent(payload: any) {
  const data = payload.data || payload;

  // Extract event ID and Type securely
  const eventId =
    data.event_id ??
    payload.id ??
    payload.eventId ??
    `fallback_${data.subscription_id ?? data.payment_id ?? "unknown"}_${Date.now()}`;

  const eventType = payload.type ?? payload.event_type ?? data.type ?? "unknown";

  // ① Store raw event FIRST (ensures no event loss if processing fails)
  const isNew = await WebhookService.store(eventId, eventType, payload);

  await AuditLogger.record({
    action: isNew ? AuditAction.WEBHOOK_RECEIVED : AuditAction.IDEMPOTENCY_HIT,
    metadata: { eventId, eventType, duplicate: !isNew },
  });

  if (!isNew) {
    // Duplicate delivery — exit idempotently
    return;
  }

  // ② Process inline with domain logic
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
 * Uses the official @dodopayments/nextjs SDK for reliable signature verification.
 * Explicitly binds to all granular webhook cases supported by the SDK.
 */
export const POST = Webhooks({
  webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY!,

  // Payments
  onPaymentSucceeded: processWebhookEvent,
  onPaymentFailed: processWebhookEvent,
  onPaymentProcessing: processWebhookEvent,
  onPaymentCancelled: processWebhookEvent,

  // Refunds
  onRefundSucceeded: processWebhookEvent,
  onRefundFailed: processWebhookEvent,

  // Disputes (Chargebacks & Arbitrations)
  onDisputeOpened: processWebhookEvent,
  onDisputeExpired: processWebhookEvent,
  onDisputeAccepted: processWebhookEvent,
  onDisputeCancelled: processWebhookEvent,
  onDisputeChallenged: processWebhookEvent,
  onDisputeWon: processWebhookEvent,
  onDisputeLost: processWebhookEvent,

  // Subscriptions
  onSubscriptionActive: processWebhookEvent,
  onSubscriptionOnHold: processWebhookEvent,
  onSubscriptionRenewed: processWebhookEvent,
  onSubscriptionPlanChanged: processWebhookEvent,
  onSubscriptionCancelled: processWebhookEvent,
  onSubscriptionFailed: processWebhookEvent,
  onSubscriptionExpired: processWebhookEvent,

  // Custom Product Events
  onLicenseKeyCreated: processWebhookEvent,
});
