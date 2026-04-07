import { prisma } from "@/lib/db";
import { Plan, SubscriptionStatus } from "@/generated/prisma/enums";
import { getPlanLimits, isPlanAtLeast } from "./plans";
import { clerkClient } from "@clerk/nextjs/server";

// Re-export everything consumers need from billing submodules
export { PLANS, getPlanLimits, canUseFeature, isPlanAtLeast } from "./plans";
export { BillingService } from "./service";
export { WebhookService } from "./webhook-service";
export { UsageService } from "./usage-service";
export { DunningService } from "./dunning";
export { AuditLogger } from "./audit";

// ─── Clerk Sync ───────────────────────────────────────────────────────────────

/**
 * Sync the user's plan and subscription metadata to Clerk publicMetadata.
 *
 * Used for fast client-side plan checks (useUser() hook) without DB roundtrips.
 * This is for UX ONLY — server-side checks always read from DB.
 */
export async function syncPlanToClerk(
  clerkId: string,
  plan: Plan,
  extra?: {
    subscriptionStatus?: string;
    gracePeriodEnd?: string | null;
  }
): Promise<void> {
  try {
    const clerk = await clerkClient();
    await clerk.users.updateUserMetadata(clerkId, {
      publicMetadata: {
        plan,
        subscriptionStatus: extra?.subscriptionStatus ?? SubscriptionStatus.ACTIVE,
        gracePeriodEnd: extra?.gracePeriodEnd ?? null,
      },
    });
  } catch (err) {
    // Never crash the billing flow on Clerk sync failures.
    // The hourly cron reconciles DB ↔ Clerk on mismatches.
    console.error(`[syncPlanToClerk] Failed for clerkId=${clerkId}:`, err);
  }
}

// ─── Quota Helpers (legacy) ───────────────────────────────────────────────────

/**
 * Check and increment the monthly export counter.
 * Returns false if the user has exhausted their monthly quota.
 *
 * @deprecated Prefer UsageService.record() for new features.
 */
export async function checkExportQuota(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, usageMonth: true, usageReset: true },
  });
  if (!user) return false;

  const limits = getPlanLimits(user.plan);
  if (limits.monthlyExports === Infinity) return true;

  const now = new Date();
  const reset = new Date(user.usageReset);
  const needsReset =
    now.getFullYear() !== reset.getFullYear() || now.getMonth() !== reset.getMonth();

  if (needsReset) {
    await prisma.user.update({
      where: { id: userId },
      data: { usageMonth: 1, usageReset: now },
    });
    return true;
  }

  if (user.usageMonth >= limits.monthlyExports) return false;

  await prisma.user.update({
    where: { id: userId },
    data: { usageMonth: { increment: 1 } },
  });

  return true;
}

/**
 * Returns how many exports the user has left this month.
 *
 * @deprecated Prefer UsageService.getQuota() for new features.
 */
export async function getRemainingExports(userId: string): Promise<number | typeof Infinity> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, usageMonth: true },
  });
  if (!user) return 0;

  const limits = getPlanLimits(user.plan);
  if (limits.monthlyExports === Infinity) return Infinity;

  return Math.max(0, limits.monthlyExports - user.usageMonth);
}

// ─── Plan Guards ─────────────────────────────────────────────────────────────

/**
 * Require at least the specified plan. Throws a readable error if not met.
 */
export async function requirePlan(userId: string, plan: Plan): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });
  if (!user || !isPlanAtLeast(user.plan, plan)) {
    throw new Error(`Upgrade required: this feature needs the ${plan} plan or above.`);
  }
}

/**
 * Server-side access check that respects the grace period.
 *
 * Returns true if:
 * - The user's current plan meets the requirement, OR
 * - The subscription is PAST_DUE and still within the grace window
 *
 * Use this in API routes and Server Actions — never rely on Clerk publicMetadata alone.
 */
export async function checkAccessWithGrace(userId: string, requiredPlan: Plan): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });
  if (!user) return false;

  if (isPlanAtLeast(user.plan, requiredPlan)) return true;

  const sub = user.subscription;
  if (
    sub &&
    sub.status === SubscriptionStatus.PAST_DUE &&
    sub.gracePeriodEnd &&
    sub.gracePeriodEnd > new Date()
  ) {
    return isPlanAtLeast(sub.plan, requiredPlan);
  }

  return false;
}

// ─── Subscription Accessor ───────────────────────────────────────────────────

/** Fetch the full subscription record for a DB user. */
export async function getSubscription(userId: string) {
  return prisma.subscription.findUnique({ where: { userId } });
}
