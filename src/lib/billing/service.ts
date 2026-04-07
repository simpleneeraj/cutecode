import { prisma } from "@/lib/db";
import { Plan, SubscriptionStatus, PaymentStatus, AuditAction } from "@/generated/prisma/enums";
import { syncPlanToClerk } from "@/lib/billing";
import { AuditLogger } from "@/lib/billing/audit";
import { DunningService } from "@/lib/billing/dunning";
import { PLAN_ORDER } from "@/lib/billing/plans";
import { GRACE_PERIOD_DAYS, DUNNING_SCHEDULE_DAYS } from "@/lib/billing/constants";
import { logger } from "@/lib/logger";

// Re-export so callers that previously imported from service.ts still compile
export { GRACE_PERIOD_DAYS, DUNNING_SCHEDULE_DAYS } from "@/lib/billing/constants";

/** Product-ID → Plan mapping. Reads from environment variables. */
function buildProductPlanMap(): Record<string, Plan> {
  return {
    [process.env.NEXT_PUBLIC_DODO_PRODUCT_PRO ?? "__unset_pro"]: Plan.PRO,
    [process.env.NEXT_PUBLIC_DODO_PRODUCT_ELITE ?? "__unset_elite"]: Plan.ELITE,
    [process.env.NEXT_PUBLIC_DODO_PRODUCT_ULTIMATE ?? "__unset_ultimate"]: Plan.ULTIMATE,
  };
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApplySubscriptionEventParams {
  dodoSubscriptionId: string;
  dodoCustomerId?: string;
  customerEmail: string;
  productId?: string;
  newStatus: SubscriptionStatus;
  periodStart: Date;
  periodEnd: Date;
  eventSeq?: number;
  eventId: string;
}

export interface RecordPaymentParams {
  userId: string;
  dodoPaymentId: string;
  idempotencyKey: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  subscriptionId?: string | null;
  periodStart?: Date;
  periodEnd?: Date;
  description?: string;
}

export interface ApplyRefundParams {
  dodoPaymentId: string;
  refundAmount: number;
  refundReason?: string;
}

// ─── BillingService ───────────────────────────────────────────────────────────

/**
 * BillingService — the ONLY layer that mutates subscription and payment state.
 *
 * Design rules:
 * 1. No billing logic inside API routes, GraphQL resolvers, or Server Actions.
 * 2. Every public method is idempotent — safe to retry on failure.
 * 3. All DB mutations go through Prisma $transaction (atomic).
 * 4. Every mutation emits an AuditLog entry.
 * 5. Clerk sync happens OUTSIDE the DB transaction (eventual consistency).
 * 6. Downgrades are always deferred to period end — never immediate.
 */
export class BillingService {
  // ── Subscription Events ─────────────────────────────────────────────────

  /**
   * Apply a webhook-driven subscription state change.
   * Single authoritative entry point for all subscription transitions.
   *
   * Handles:
   * - Out-of-order event protection via eventSeq
   * - Deferred downgrades (scheduledPlan at period end)
   * - Grace period calculation for PAST_DUE
   * - Dunning email scheduling
   * - Clerk publicMetadata sync
   */
  static async applySubscriptionEvent(params: ApplySubscriptionEventParams): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email: params.customerEmail },
      select: { id: true, clerkId: true, plan: true },
    });

    if (!user) {
      throw new Error(`[BillingService] No user found for email: ${params.customerEmail}`);
    }

    const existingSub = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });

    // ── Out-of-order webhook protection ────────────────────────────────────
    if (
      existingSub &&
      params.eventSeq !== undefined &&
      existingSub.lastEventSeq >= params.eventSeq
    ) {
      await AuditLogger.record({
        userId: user.id,
        action: AuditAction.IDEMPOTENCY_HIT,
        metadata: {
          reason: "out_of_order_event",
          incomingSeq: params.eventSeq,
          storedSeq: existingSub.lastEventSeq,
          eventId: params.eventId,
        },
      });
      logger.warn(
        { eventSeq: params.eventSeq, storedSeq: existingSub.lastEventSeq },
        `[BillingService] Skipping out-of-order event`
      );
      return;
    }

    // ── Resolve new plan from product_id ────────────────────────────────────
    const newPlan = BillingService.resolvePlan(params.newStatus, params.productId);

    // ── Downgrade detection — always defer to period end ───────────────────
    const currentPlanRank = PLAN_ORDER[existingSub?.plan ?? Plan.FREE] ?? 0;
    const newPlanRank = PLAN_ORDER[newPlan] ?? 0;
    const isDowngrade =
      existingSub !== null &&
      newPlan !== Plan.FREE &&
      newPlanRank < currentPlanRank;

    // ── Grace period for PAST_DUE ────────────────────────────────────────────
    const gracePeriodEnd =
      params.newStatus === SubscriptionStatus.PAST_DUE
        ? new Date(params.periodEnd.getTime() + GRACE_PERIOD_DAYS * 86_400_000)
        : null;

    // ── Atomic DB write ──────────────────────────────────────────────────────
    await prisma.$transaction(async (tx) => {
      await tx.subscription.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          dodoSubscriptionId: params.dodoSubscriptionId,
          dodoCustomerId: params.dodoCustomerId,
          plan: newPlan,
          status: params.newStatus,
          currentPeriodStart: params.periodStart,
          currentPeriodEnd: params.periodEnd,
          gracePeriodEnd,
          cancelAtPeriodEnd: params.newStatus === SubscriptionStatus.CANCELED,
          canceledAt: params.newStatus === SubscriptionStatus.CANCELED ? new Date() : undefined,
          lastEventSeq: params.eventSeq ?? 0,
          lastEventAt: new Date(),
        },
        update: {
          dodoCustomerId: params.dodoCustomerId ?? undefined,
          plan: isDowngrade ? undefined : newPlan,
          scheduledPlan: isDowngrade ? newPlan : null,
          scheduledPlanAt: isDowngrade ? params.periodEnd : null,
          status: params.newStatus,
          currentPeriodStart: params.periodStart,
          currentPeriodEnd: params.periodEnd,
          gracePeriodEnd,
          cancelAtPeriodEnd: params.newStatus === SubscriptionStatus.CANCELED,
          canceledAt: params.newStatus === SubscriptionStatus.CANCELED ? new Date() : undefined,
          lastEventSeq: params.eventSeq ?? 0,
          lastEventAt: new Date(),
        },
      });

      if (!isDowngrade) {
        await tx.user.update({
          where: { id: user.id },
          data: { plan: newPlan },
        });
      }

      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: isDowngrade
            ? AuditAction.PLAN_DOWNGRADE_SCHEDULED
            : BillingService.auditActionForStatus(params.newStatus),
          metadata: {
            eventId: params.eventId,
            eventSeq: params.eventSeq,
            newPlan,
            newStatus: params.newStatus,
            periodEnd: params.periodEnd.toISOString(),
            gracePeriodEnd: gracePeriodEnd?.toISOString() ?? null,
            isDowngrade,
          } as object,
        },
      });
    });

    // ── Clerk sync (outside transaction — eventual consistency) ─────────────
    if (!isDowngrade) {
      await syncPlanToClerk(user.clerkId, newPlan, {
        subscriptionStatus: params.newStatus,
        gracePeriodEnd: gracePeriodEnd?.toISOString() ?? null,
      });
    }

    // ── Cancel dunning if subscription recovered ────────────────────────────
    if (
      params.newStatus === SubscriptionStatus.ACTIVE &&
      existingSub?.status === SubscriptionStatus.PAST_DUE
    ) {
      const sub = await prisma.subscription.findUnique({ where: { userId: user.id } });
      if (sub) await DunningService.cancel(sub.id);
    }

    // ── Schedule dunning if payment failed ─────────────────────────────────
    if (params.newStatus === SubscriptionStatus.PAST_DUE) {
      await DunningService.schedule(user.id, params.dodoSubscriptionId);
    }
  }

  // ── Payment Recording ───────────────────────────────────────────────────

  /**
   * Record a payment event. Idempotent via dodoPaymentId unique constraint.
   */
  static async recordPayment(params: RecordPaymentParams): Promise<void> {
    await prisma.payment.upsert({
      where: { dodoPaymentId: params.dodoPaymentId },
      create: {
        userId: params.userId,
        dodoPaymentId: params.dodoPaymentId,
        idempotencyKey: params.idempotencyKey,
        amount: params.amount,
        currency: params.currency,
        status: params.status,
        subscriptionId: params.subscriptionId ?? null,
        periodStart: params.periodStart ?? null,
        periodEnd: params.periodEnd ?? null,
        description: params.description ?? null,
      },
      update: {
        status: params.status, // only status can change on retry
      },
    });

    await AuditLogger.record({
      userId: params.userId,
      action:
        params.status === PaymentStatus.SUCCEEDED
          ? AuditAction.PAYMENT_SUCCEEDED
          : AuditAction.PAYMENT_FAILED,
      metadata: {
        dodoPaymentId: params.dodoPaymentId,
        amount: params.amount,
        currency: params.currency,
        status: params.status,
      },
    });
  }

  // ── Refunds ─────────────────────────────────────────────────────────────

  /**
   * Apply a full or partial refund. Cumulative refundedAmount tracked.
   */
  static async applyRefund(params: ApplyRefundParams): Promise<void> {
    const payment = await prisma.payment.findUnique({
      where: { dodoPaymentId: params.dodoPaymentId },
    });

    if (!payment) {
      throw new Error(`[BillingService] Payment not found: ${params.dodoPaymentId}`);
    }

    const newRefundedAmount = payment.refundedAmount + params.refundAmount;

    if (newRefundedAmount > payment.amount) {
      throw new Error(
        `[BillingService] Refund ${newRefundedAmount} exceeds original amount ${payment.amount}`
      );
    }

    const isFullRefund = newRefundedAmount >= payment.amount;

    await prisma.$transaction([
      prisma.payment.update({
        where: { dodoPaymentId: params.dodoPaymentId },
        data: {
          status: isFullRefund ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED,
          refundedAmount: newRefundedAmount,
          refundedAt: new Date(),
          refundReason: params.refundReason ?? null,
        },
      }),
      prisma.auditLog.create({
        data: {
          userId: payment.userId,
          action: AuditAction.PAYMENT_REFUNDED,
          metadata: {
            dodoPaymentId: params.dodoPaymentId,
            refundAmount: params.refundAmount,
            totalRefunded: newRefundedAmount,
            originalAmount: payment.amount,
            isFullRefund,
          } as object,
        },
      }),
    ]);
  }

  // ── Disputes ────────────────────────────────────────────────────────────

  /**
   * Handle dispute and chargeback updates.
   * Maps DodoPayments dispute states to our Payment record.
   */
  static async updateDispute(
    dodoPaymentId: string,
    status: PaymentStatus,
    disputeId?: string
  ): Promise<void> {
    const payment = await prisma.payment.findUnique({
      where: { dodoPaymentId },
    });

    if (!payment) {
      logger.warn({ dodoPaymentId }, `[BillingService] Attempted to update dispute for missing payment`);
      return;
    }

    const isChargeback = status === PaymentStatus.CHARGEBACK;
    const isDisputed = status === PaymentStatus.DISPUTED;

    await prisma.$transaction([
      prisma.payment.update({
        where: { dodoPaymentId },
        data: {
          status,
          disputeId: disputeId ?? payment.disputeId,
          disputedAt: isDisputed ? new Date() : payment.disputedAt,
          chargebackAt: isChargeback ? new Date() : payment.chargebackAt,
        },
      }),
      prisma.auditLog.create({
        data: {
          userId: payment.userId,
          // We use PAYMENT_FAILED generically for dispute/chargeback accounting flows
          action: AuditAction.PAYMENT_FAILED,
          metadata: {
            dodoPaymentId,
            status,
            disputeId,
            actionContext: "dispute_update"
          } as object,
        },
      }),
    ]);
  }

  // ── Cancellation ────────────────────────────────────────────────────────

  /** Soft-cancel: mark subscription to cancel at period end. Access retained until then. */
  static async scheduleCancellation(userId: string): Promise<void> {
    const sub = await prisma.subscription.findUnique({ where: { userId } });
    if (!sub) throw new Error(`[BillingService] No subscription for user ${userId}`);

    await prisma.$transaction([
      prisma.subscription.update({
        where: { userId },
        data: { cancelAtPeriodEnd: true, canceledAt: new Date() },
      }),
      prisma.auditLog.create({
        data: {
          userId,
          action: AuditAction.SUBSCRIPTION_CANCELED,
          metadata: {
            subscriptionId: sub.id,
            accessUntil: sub.currentPeriodEnd.toISOString(),
            type: "end_of_period",
          } as object,
        },
      }),
    ]);
  }

  /** Reactivate a subscription before full expiry — clears the cancel flag. */
  static async reactivate(userId: string): Promise<void> {
    const sub = await prisma.subscription.findUnique({ where: { userId } });
    if (!sub) throw new Error(`[BillingService] No subscription for user ${userId}`);

    if (sub.status === SubscriptionStatus.EXPIRED) {
      throw new Error(
        `[BillingService] Subscription expired — user must start a new checkout`
      );
    }

    await prisma.$transaction([
      prisma.subscription.update({
        where: { userId },
        data: { cancelAtPeriodEnd: false, canceledAt: null },
      }),
      prisma.auditLog.create({
        data: {
          userId,
          action: AuditAction.SUBSCRIPTION_REACTIVATED,
          metadata: { subscriptionId: sub.id } as object,
        },
      }),
    ]);
  }

  // ── Private Helpers ─────────────────────────────────────────────────────

  private static resolvePlan(status: SubscriptionStatus, productId?: string): Plan {
    const isActiveState =
      status === SubscriptionStatus.ACTIVE || status === SubscriptionStatus.TRIALING;

    if (!isActiveState || !productId) return Plan.FREE;

    const map = buildProductPlanMap();
    return map[productId] ?? Plan.FREE;
  }

  private static auditActionForStatus(status: SubscriptionStatus): AuditAction {
    const map: Partial<Record<SubscriptionStatus, AuditAction>> = {
      [SubscriptionStatus.ACTIVE]: AuditAction.SUBSCRIPTION_UPDATED,
      [SubscriptionStatus.TRIALING]: AuditAction.TRIAL_STARTED,
      [SubscriptionStatus.CANCELED]: AuditAction.SUBSCRIPTION_CANCELED,
      [SubscriptionStatus.PAST_DUE]: AuditAction.GRACE_PERIOD_STARTED,
      [SubscriptionStatus.UNPAID]: AuditAction.ACCESS_REVOKED,
      [SubscriptionStatus.EXPIRED]: AuditAction.ACCESS_REVOKED,
    };
    return map[status] ?? AuditAction.SUBSCRIPTION_UPDATED;
  }
}
