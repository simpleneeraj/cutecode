import { prisma } from "@/lib/db";
import { Plan } from "@/generated/prisma/enums";
import { getPlanLimits } from "@/lib/billing/plans";

/**
 * UsageService — metered billing and real-time quota enforcement.
 *
 * Design decisions:
 * - UsageEvent is append-only. Never UPDATE rows — only INSERT.
 * - Quota is checked and enforced in real-time (no pre-aggregated counter).
 * - Client provides idempotencyKey to safely retry failed requests without
 *   double-counting (e.g., network timeout after server inserts but before
 *   client receives 200).
 * - Backdated events (occurredAt before this month's 1st) are accepted but
 *   flagged with isBackdated=true for audit and anomaly detection.
 * - billingWindow captures the YYYY-MM month of occurredAt — not createdAt —
 *   so a late-arriving event is billed to the correct month.
 */
export class UsageService {
  /**
   * Record a single billable usage event and check quota.
   *
   * Returns:
   *   { allowed: false } — quota exceeded, action should be blocked
   *   { allowed: true, remaining } — action allowed, remaining quota returned
   *
   * Idempotent: supplying the same idempotencyKey always returns the same result
   * without inserting a duplicate row.
   */
  static async record(params: {
    userId: string;
    feature: string;
    quantity?: number;
    /** Defaults to now(). Set explicitly if the action occurred in the past. */
    occurredAt?: Date;
    /**
     * Client-generated UUID. Recommended for all callers.
     * Prevents double-counting on network retries.
     */
    idempotencyKey?: string;
  }): Promise<{ allowed: boolean; remaining: number | typeof Infinity }> {
    const quantity = params.quantity ?? 1;
    const occurredAt = params.occurredAt ?? new Date();
    const billingWindow = UsageService.getBillingWindow(occurredAt);

    // Flag events with occurredAt before this calendar month's start
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const isBackdated = occurredAt < monthStart;

    // ── Quota check ────────────────────────────────────────────────────────
    const quota = await UsageService.getQuota(params.userId, params.feature, billingWindow);
    if (!quota.allowed) {
      return { allowed: false, remaining: 0 };
    }

    // ── Idempotency: skip insert if this key already exists ────────────────
    if (params.idempotencyKey) {
      const existing = await prisma.usageEvent.findUnique({
        where: { idempotencyKey: params.idempotencyKey },
        select: { id: true },
      });
      if (existing) {
        // Already recorded — return current remaining without decrementing
        return {
          allowed: true,
          remaining:
            quota.remaining === Infinity
              ? Infinity
              : Math.max(0, (quota.remaining as number) - quantity),
        };
      }
    }

    // ── Insert usage event ─────────────────────────────────────────────────
    await prisma.usageEvent.create({
      data: {
        userId: params.userId,
        feature: params.feature,
        quantity,
        occurredAt,
        billingWindow,
        idempotencyKey: params.idempotencyKey ?? null,
        isBackdated,
      },
    });

    return {
      allowed: true,
      remaining:
        quota.remaining === Infinity
          ? Infinity
          : Math.max(0, (quota.remaining as number) - quantity),
    };
  }

  /**
   * Retrieve current quota status without recording an event.
   * Use this for pre-flight checks (e.g., disable "Export" button when quota = 0).
   */
  static async getQuota(
    userId: string,
    feature: string,
    billingWindow?: string
  ): Promise<{
    allowed: boolean;
    used: number;
    limit: number | typeof Infinity;
    remaining: number | typeof Infinity;
  }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });
    if (!user) return { allowed: false, used: 0, limit: 0, remaining: 0 };

    const limits = getPlanLimits(user.plan as Plan);
    const limit: number | typeof Infinity =
      feature === "export" ? limits.monthlyExports : Infinity;

    // Unlimited plans — skip the DB aggregate
    if (limit === Infinity) {
      return { allowed: true, used: 0, limit: Infinity, remaining: Infinity };
    }

    const window = billingWindow ?? UsageService.getBillingWindow(new Date());
    const { _sum } = await prisma.usageEvent.aggregate({
      where: { userId, feature, billingWindow: window },
      _sum: { quantity: true },
    });

    const used = _sum.quantity ?? 0;
    const remaining = Math.max(0, (limit as number) - used);

    return { allowed: used < (limit as number), used, limit, remaining };
  }

  /**
   * Get usage summary across all features for a user in the current billing window.
   * Useful for the account settings / billing page.
   */
  static async getSummary(
    userId: string,
    billingWindow?: string
  ): Promise<Record<string, { used: number; limit: number | typeof Infinity }>> {
    const window = billingWindow ?? UsageService.getBillingWindow(new Date());

    const events = await prisma.usageEvent.groupBy({
      by: ["feature"],
      where: { userId, billingWindow: window },
      _sum: { quantity: true },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });
    const limits = user ? getPlanLimits(user.plan as Plan) : null;

    return Object.fromEntries(
      events.map((e) => [
        e.feature,
        {
          used: e._sum.quantity ?? 0,
          limit:
            e.feature === "export" ? (limits?.monthlyExports ?? 0) : (Infinity as typeof Infinity),
        },
      ])
    );
  }

  /** Returns the YYYY-MM billing window string for a given date. */
  static getBillingWindow(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  }
}
