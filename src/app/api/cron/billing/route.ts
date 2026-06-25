import { prisma } from "@/lib/db";
import { syncPlanToSupabase } from "@/lib/billing";
import { NextRequest, NextResponse } from "next/server";
import { SubscriptionStatus, Plan } from "@/generated/prisma/enums";

/**
 * GET /api/cron/billing
 *
 * Daily billing reconciliation cron (see vercel.json schedule). All steps are
 * idempotent.
 *
 * Responsibilities:
 * 1. Expire subscriptions past their grace period → downgrade plan to FREE
 * 2. Apply scheduled plan downgrades at period end
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const cronSecret = req.headers.get("x-cron-secret");
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const results = {
    expiredCount: 0,
    downgradesApplied: 0,
    errors: [] as string[],
    ranAt: now.toISOString(),
  };

  // ── Step 1: Expire subscriptions past grace period ─────────────────────────
  try {
    const toExpire = await prisma.subscription.findMany({
      where: {
        status: { in: [SubscriptionStatus.PAST_DUE, SubscriptionStatus.UNPAID] },
        gracePeriodEnd: { not: null, lte: now },
      },
      include: { user: { select: { id: true, supabaseId: true } } },
    });

    for (const sub of toExpire) {
      try {
        await prisma.$transaction([
          prisma.subscription.update({
            where: { id: sub.id },
            data: { status: SubscriptionStatus.EXPIRED },
          }),
          prisma.user.update({
            where: { id: sub.userId },
            data: { plan: Plan.FREE },
          }),
        ]);

        await syncPlanToSupabase(sub.user.supabaseId, Plan.FREE, {
          subscriptionStatus: SubscriptionStatus.EXPIRED,
          gracePeriodEnd: null,
        });

        results.expiredCount++;
      } catch (err) {
        const msg = `Expire ${sub.id}: ${err instanceof Error ? err.message : String(err)}`;
        console.error(`[cron:billing] ${msg}`);
        results.errors.push(msg);
      }
    }
  } catch (err) {
    results.errors.push(`Step 1 (expire) failed: ${String(err)}`);
  }

  // ── Step 2: Apply scheduled plan downgrades ────────────────────────────────
  try {
    const scheduledDowngrades = await prisma.subscription.findMany({
      where: {
        scheduledPlan: { not: null },
        scheduledPlanAt: { not: null, lte: now },
      },
      include: { user: { select: { supabaseId: true } } },
    });

    for (const sub of scheduledDowngrades) {
      if (!sub.scheduledPlan) continue;
      try {
        await prisma.$transaction([
          prisma.subscription.update({
            where: { id: sub.id },
            data: { plan: sub.scheduledPlan, scheduledPlan: null, scheduledPlanAt: null },
          }),
          prisma.user.update({
            where: { id: sub.userId },
            data: { plan: sub.scheduledPlan },
          }),
        ]);

        await syncPlanToSupabase(sub.user.supabaseId, sub.scheduledPlan, {
          subscriptionStatus: sub.status,
        });

        results.downgradesApplied++;
      } catch (err) {
        const msg = `Downgrade ${sub.id}: ${String(err)}`;
        console.error(`[cron:billing] ${msg}`);
        results.errors.push(msg);
      }
    }
  } catch (err) {
    results.errors.push(`Step 2 (downgrades) failed: ${String(err)}`);
  }

  const level = results.errors.length > 0 ? "warn" : "info";
  console[level]("[cron:billing]", results);

  return NextResponse.json(results, {
    status: results.errors.length > 0 ? 207 : 200,
  });
}
