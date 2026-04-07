"use client";

import { useUser } from "@clerk/nextjs";
import { Plan } from "@/generated/prisma/enums";
import { PLAN_ORDER } from "@/lib/billing/plans";

/**
 * Client-side subscription hook.
 *
 * Reads plan data from Clerk publicMetadata — kept in sync by our webhook handler.
 * Use for UI gating ONLY. All real enforcement is always server-side.
 *
 * publicMetadata shape (set by syncPlanToClerk):
 *   { plan, subscriptionStatus, gracePeriodEnd }
 */
export function useSubscription() {
  const { user, isLoaded } = useUser();

  const plan = (user?.publicMetadata?.plan as Plan) ?? Plan.FREE;
  const subscriptionStatus = (user?.publicMetadata?.subscriptionStatus as string) ?? "active";
  const gracePeriodEndRaw = user?.publicMetadata?.gracePeriodEnd as string | null | undefined;
  const gracePeriodEnd = gracePeriodEndRaw ? new Date(gracePeriodEndRaw) : null;

  const planRank = PLAN_ORDER[plan] ?? 0;

  const isPro = planRank >= PLAN_ORDER[Plan.PRO];
  const isElite = planRank >= PLAN_ORDER[Plan.ELITE];
  const isUltimate = plan === Plan.ULTIMATE;
  const isFree = plan === Plan.FREE;

  /** True when payment has failed but the user is still in the grace window. */
  const isPastDue = subscriptionStatus === "PAST_DUE";

  /** True when the grace period has expired — access should be treated as FREE. */
  const isExpired = subscriptionStatus === "EXPIRED" || subscriptionStatus === "UNPAID";

  /**
   * Whether to show a "payment required" banner in the UI.
   * The user still has access but should be prompted to update payment method.
   */
  const showPaymentBanner = isPastDue && gracePeriodEnd !== null;

  return {
    plan,
    subscriptionStatus,
    gracePeriodEnd,
    isPro,
    isElite,
    isUltimate,
    isFree,
    isPastDue,
    isExpired,
    showPaymentBanner,
    isLoaded,
  };
}
