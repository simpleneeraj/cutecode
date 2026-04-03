"use client";

import { useUser } from "@clerk/nextjs";
import { Plan } from "@/generated/prisma/enums";
import { PLAN_ORDER } from "@/lib/billing/plans";

/**
 * Client-side subscription hook.
 *
 * Reads plan from Clerk publicMetadata (synced via DodoPayments webhook).
 * Use for UI gating ONLY — all real enforcement is server-side.
 */
export function useSubscription() {
  const { user, isLoaded } = useUser();

  const plan = (user?.publicMetadata?.plan as Plan) ?? Plan.FREE;

  const isPro = PLAN_ORDER[plan] >= PLAN_ORDER[Plan.PRO];
  const isElite = PLAN_ORDER[plan] >= PLAN_ORDER[Plan.ELITE];
  const isUltimate = plan === Plan.ULTIMATE;

  return {
    plan,
    isPro,
    isElite,
    isUltimate,
    isFree: plan === Plan.FREE,
    isLoaded,
  };
}
