import { prisma } from "@/lib/db";
import { Plan, SubscriptionStatus } from "@/generated/prisma/enums";
import { syncPlanToSupabase } from "@/lib/billing";
import { PLAN_ORDER } from "@/lib/billing/plans";
import { GRACE_PERIOD_DAYS } from "@/lib/billing/constants";
import { logger } from "@/lib/logger";

// Re-export so callers that previously imported from service.ts still compile
export { GRACE_PERIOD_DAYS } from "@/lib/billing/constants";

/** Product-ID → Plan mapping. Reads from environment variables. */
function buildProductPlanMap(): Record<string, Plan> {
  return {
    [process.env.NEXT_PUBLIC_DODO_PRODUCT_PRO ?? "__unset_pro"]: Plan.PRO,
    [process.env.NEXT_PUBLIC_DODO_PRODUCT_PREMIUM ?? "__unset_premium"]: Plan.PREMIUM,
  };
}

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

/**
 * BillingService — the ONLY layer that mutates subscription and plan state.
 *
 * Design rules:
 * 1. No billing logic inside API routes or Server Actions.
 * 2. The public method is idempotent — safe to retry on failure.
 * 3. DB mutations go through a Prisma $transaction (atomic).
 * 4. Supabase app_metadata sync happens OUTSIDE the transaction (eventual consistency, UX only).
 * 5. Downgrades are always deferred to period end — never immediate.
 */
export class BillingService {
  /**
   * Apply a webhook-driven subscription state change.
   * Single authoritative entry point for all subscription transitions.
   *
   * Handles:
   * - Out-of-order event protection via eventSeq
   * - Deferred downgrades (scheduledPlan at period end)
   * - Grace period calculation for PAST_DUE
   * - Supabase app_metadata sync
   */
  static async applySubscriptionEvent(params: ApplySubscriptionEventParams): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email: params.customerEmail },
      select: { id: true, supabaseId: true, plan: true },
    });

    if (!user) {
      throw new Error(`[BillingService] No user found for email: ${params.customerEmail}`);
    }

    const existingSub = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });

    // ── Out-of-order webhook protection ────────────────────────────────────
    if (existingSub && params.eventSeq !== undefined && existingSub.lastEventSeq >= params.eventSeq) {
      logger.warn(
        { eventSeq: params.eventSeq, storedSeq: existingSub.lastEventSeq, eventId: params.eventId },
        `[BillingService] Skipping out-of-order event`,
      );
      return;
    }

    // ── Resolve new plan from product_id ────────────────────────────────────
    const newPlan = BillingService.resolvePlan(params.newStatus, params.productId);

    // ── Downgrade detection — always defer to period end ───────────────────
    const currentPlanRank = PLAN_ORDER[existingSub?.plan ?? Plan.FREE] ?? 0;
    const newPlanRank = PLAN_ORDER[newPlan] ?? 0;
    const isDowngrade = existingSub !== null && newPlan !== Plan.FREE && newPlanRank < currentPlanRank;

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
    });

    // ── Supabase sync (outside transaction — eventual consistency, UX only) ──
    if (!isDowngrade) {
      await syncPlanToSupabase(user.supabaseId, newPlan, {
        subscriptionStatus: params.newStatus,
        gracePeriodEnd: gracePeriodEnd?.toISOString() ?? null,
      });
    }
  }

  // ── Private Helpers ─────────────────────────────────────────────────────

  private static resolvePlan(status: SubscriptionStatus, productId?: string): Plan {
    const isActiveState = status === SubscriptionStatus.ACTIVE || status === SubscriptionStatus.TRIALING;

    if (!isActiveState || !productId) return Plan.FREE;

    const map = buildProductPlanMap();
    return map[productId] ?? Plan.FREE;
  }
}
