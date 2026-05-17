"use client";

import { useUser } from "@clerk/nextjs";
import { PLAN_ORDER } from "@/lib/billing/plans";
import { Plan, SubscriptionStatus } from "@/generated/prisma/enums";

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

  /** True when payment has failed but the user is still in the grace window. */
  const isPastDue = subscriptionStatus === SubscriptionStatus.PAST_DUE;

  /** True when the grace period has expired — access should be treated as FREE. */
  const isExpired =
    subscriptionStatus === SubscriptionStatus.EXPIRED || subscriptionStatus === SubscriptionStatus.UNPAID;

  // An expired subscription means the user has lost access even if plan metadata
  // still says PRO — webhook may not have synced yet on the client.
  const isPro = planRank >= PLAN_ORDER[Plan.PRO] && !isExpired;
  const isElite = planRank >= PLAN_ORDER[Plan.ELITE] && !isExpired;
  const isUltimate = plan === Plan.ULTIMATE && !isExpired;
  const isFree = plan === Plan.FREE || isExpired;

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
