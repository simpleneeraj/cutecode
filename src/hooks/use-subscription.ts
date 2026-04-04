"use client";

import { useAuth } from "@clerk/nextjs";

/**
 * Client-side subscription hook — powered by Clerk Billing.
 *
 * Uses Clerk's native has() to check Plans configured in the Clerk Dashboard.
 * Plan slugs must match the slugs set in the Clerk Dashboard.
 * Use for UI gating ONLY — all real enforcement is server-side via auth().has().
 */
export function useSubscription() {
  const { has, isLoaded } = useAuth();

  const isUltimate = has?.({ plan: "ultimate" }) ?? false;
  const isElite = isUltimate || (has?.({ plan: "elite" }) ?? false);
  const isPro = isElite || (has?.({ plan: "pro" }) ?? false);

  // Derive a display-friendly plan label
  const plan = isUltimate
    ? "ultimate"
    : isElite
    ? "elite"
    : isPro
    ? "pro"
    : "free";

  return {
    plan,
    isPro,
    isElite,
    isUltimate,
    isFree: !isPro,
    isLoaded,
  };
}
