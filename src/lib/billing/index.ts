import { prisma } from "@/lib/db";
import { Plan } from "@/generated/prisma/client";
import { getPlanLimits, isPlanAtLeast } from "./plans";
import { clerkClient } from "@clerk/nextjs/server";
export { PLANS, getPlanLimits, canUseFeature, isPlanAtLeast } from "./plans";

/** Fetch the subscription record for a DB user */
export async function getSubscription(userId: string) {
  return prisma.subscription.findUnique({
    where: { userId },
  });
}

/**
 * Check and increment the monthly export counter.
 * Returns false if the user has exhausted their monthly quota.
 *
 * This is the authoritative (server-side) quota check.
 * Frontend checks are UX only.
 */
export async function checkExportQuota(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, usageMonth: true, usageReset: true },
  });
  if (!user) return false;

  const limits = getPlanLimits(user.plan);
  if (limits.monthlyExports === Infinity) return true;

  // Reset counter if we're in a new calendar month
  const now = new Date();
  const reset = new Date(user.usageReset);
  const needsReset = now.getFullYear() !== reset.getFullYear() || now.getMonth() !== reset.getMonth();

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
 * Returns Infinity for unlimited plans.
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

/**
 * Sync the user's plan to their Clerk publicMetadata.
 * Allows the client-side useSubscription hook to work without a DB call.
 */
export async function syncPlanToClerk(clerkId: string, plan: Plan) {
  const clerk = await clerkClient();
  await clerk.users.updateUserMetadata(clerkId, {
    publicMetadata: { plan },
  });
}

/**
 * Check if a user has at least the required plan tier. Throws if not.
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
