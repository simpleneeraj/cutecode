import { prisma } from "@/lib/db";
import { syncPlanToClerk } from "@/lib/billing";
import { DunningService } from "@/lib/billing/dunning";
import { NextRequest, NextResponse } from "next/server";
import { WebhookService } from "@/lib/billing/webhook-service";
import { SubscriptionStatus, Plan, AuditAction } from "@/generated/prisma/enums";

/**
 * GET /api/cron/billing
 *
 * Hourly billing reconciliation cron. All steps are idempotent.
 *
 * Add to vercel.json:
 * {
 *   "crons": [{ "path": "/api/cron/billing", "schedule": "0 * * * *" }]
 * }
 *
 * Responsibilities:
 * 1. Expire subscriptions past grace period → downgrade plan to FREE
 * 2. Apply scheduled plan downgrades at period end
 * 3. Send due dunning emails
 * 4. Retry FAILED webhook events with exponential backoff
 * 5. Purge expired IdempotencyKey rows
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
    dunningEmailsSent: 0,
    webhookRetriesAttempted: 0,
    idempotencyKeysPurged: 0,
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
      include: { user: { select: { id: true, clerkId: true } } },
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
          prisma.auditLog.create({
            data: {
              userId: sub.userId,
              action: AuditAction.ACCESS_REVOKED,
              metadata: {
                reason: "grace_period_expired",
                subscriptionId: sub.id,
                gracePeriodEnd: sub.gracePeriodEnd?.toISOString(),
              } as object,
            },
          }),
        ]);

        await syncPlanToClerk(sub.user.clerkId, Plan.FREE, {
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
      include: { user: { select: { clerkId: true } } },
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
          prisma.auditLog.create({
            data: {
              userId: sub.userId,
              action: AuditAction.PLAN_DOWNGRADED,
              metadata: {
                subscriptionId: sub.id,
                newPlan: sub.scheduledPlan,
                appliedAt: now.toISOString(),
              } as object,
            },
          }),
        ]);

        await syncPlanToClerk(sub.user.clerkId, sub.scheduledPlan, {
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

  // ── Step 3: Send due dunning emails ──────────────────────────────────────
  try {
    results.dunningEmailsSent = await DunningService.processDue();
  } catch (err) {
    results.errors.push(`Step 3 (dunning) failed: ${String(err)}`);
  }

  // ── Step 4: Retry FAILED webhook events ──────────────────────────────────
  try {
    results.webhookRetriesAttempted = await WebhookService.retryFailed();
  } catch (err) {
    results.errors.push(`Step 4 (webhook retry) failed: ${String(err)}`);
  }

  // ── Step 5: Purge expired IdempotencyKey rows ─────────────────────────────
  try {
    const { count } = await prisma.idempotencyKey.deleteMany({
      where: { expiresAt: { lt: now } },
    });
    results.idempotencyKeysPurged = count;
  } catch (err) {
    results.errors.push(`Step 5 (idempotency purge) failed: ${String(err)}`);
  }

  const level = results.errors.length > 0 ? "warn" : "info";
  console[level]("[cron:billing]", results);

  return NextResponse.json(results, {
    status: results.errors.length > 0 ? 207 : 200,
  });
}
