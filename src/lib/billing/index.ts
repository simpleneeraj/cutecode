import { Plan, SubscriptionStatus } from "@/generated/prisma/enums";
import { createAdminClient } from "@/lib/supabase/admin";

// Re-export everything consumers need from billing submodules
export { PLANS, getPlanLimits, canUseFeature, isPlanAtLeast } from "./plans";
export { BillingService } from "./service";
export { WebhookService } from "./webhook-service";

// ─── Supabase Sync ──────────────────────────────────────────────────────────────

/**
 * Sync the user's plan and subscription metadata to Supabase app_metadata.
 *
 * Used for fast client-side plan checks (useUser() hook) without DB roundtrips.
 * This is for UX ONLY — server-side checks always read from the DB.
 */
export async function syncPlanToSupabase(
  supabaseId: string,
  plan: Plan,
  extra?: {
    subscriptionStatus?: string;
    gracePeriodEnd?: string | null;
  },
): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.auth.admin.updateUserById(supabaseId, {
      app_metadata: {
        plan,
        subscriptionStatus: extra?.subscriptionStatus ?? SubscriptionStatus.ACTIVE,
        gracePeriodEnd: extra?.gracePeriodEnd ?? null,
      },
    });
  } catch (err) {
    // Never crash the billing flow on sync failures.
    // The billing cron reconciles DB ↔ Supabase on mismatches.
    console.error(`[syncPlanToSupabase] Failed for supabaseId=${supabaseId}:`, err);
  }
}
