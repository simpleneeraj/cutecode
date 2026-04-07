import { prisma } from "@/lib/db";
import { DUNNING_SCHEDULE_DAYS } from "@/lib/billing/constants";

const EMAIL_TYPES = ["soft_reminder", "urgent", "final_notice"] as const;
type EmailType = (typeof EMAIL_TYPES)[number];

/**
 * DunningService — payment failure recovery via staged email notifications.
 *
 * Schedule (from DUNNING_SCHEDULE_DAYS):
 *   Day 1  → soft_reminder  ("We couldn't process your payment")
 *   Day 5  → urgent         ("Action required — subscription on hold")
 *   Day 13 → final_notice   ("Your account will be downgraded in 24h")
 *
 * Integrate your email provider by replacing the console.info below.
 */
export class DunningService {
  /**
   * Schedule dunning emails for a newly-PAST_DUE subscription.
   * Idempotent: re-calling for the same subscription is a no-op.
   */
  static async schedule(userId: string, dodoSubscriptionId: string): Promise<void> {
    const sub = await prisma.subscription.findFirst({
      where: { userId, dodoSubscriptionId },
    });
    if (!sub) {
      console.warn(`[DunningService] Subscription not found for user ${userId}`);
      return;
    }

    const now = new Date();

    await prisma.$transaction(
      (DUNNING_SCHEDULE_DAYS as readonly number[]).map((dayOffset: number, i: number) =>
        prisma.dunningAttempt.upsert({
          where: { id: `${sub.id}_dun_${i + 1}` },
          create: {
            id: `${sub.id}_dun_${i + 1}`,
            userId,
            subscriptionId: sub.id,
            attemptNumber: i + 1,
            scheduledAt: new Date(now.getTime() + dayOffset * 86_400_000),
            emailType: EMAIL_TYPES[i] as EmailType,
          },
          update: {}, // no-op if already scheduled
        })
      )
    );
  }

  /**
   * Process all dunning attempts that are due and not yet sent.
   * Called by the hourly cron job at /api/cron/billing.
   * Returns the number of emails sent successfully.
   */
  static async processDue(): Promise<number> {
    const due = await prisma.dunningAttempt.findMany({
      where: {
        scheduledAt: { lte: new Date() },
        sentAt: null,
      },
      include: {
        user: { select: { email: true, name: true } },
        subscription: { select: { plan: true, currentPeriodEnd: true } },
      },
      orderBy: { scheduledAt: "asc" },
    });

    let sent = 0;

    for (const attempt of due) {
      try {
        // ── Replace with your email provider (Resend, Postmark, AWS SES) ──
        // await resend.emails.send({
        //   from: "billing@cutecode.app",
        //   to: attempt.user.email,
        //   subject: DunningService.subjectFor(attempt.emailType),
        //   react: DunningEmailTemplate({ emailType: attempt.emailType, plan: attempt.subscription.plan }),
        // });
        console.info(
          `[DunningService] Sending "${attempt.emailType}" to ${attempt.user.email} ` +
            `(attempt ${attempt.attemptNumber}, expires ${attempt.subscription.currentPeriodEnd.toISOString()})`
        );
        // ─────────────────────────────────────────────────────────────────

        await prisma.dunningAttempt.update({
          where: { id: attempt.id },
          data: { sentAt: new Date(), succeeded: true },
        });

        sent++;
      } catch (err) {
        console.error(`[DunningService] Failed to send attempt ${attempt.id}:`, err);
      }
    }

    return sent;
  }

  /**
   * Cancel all unsent dunning attempts for a subscription.
   * Called when payment recovers (subscription returns to ACTIVE).
   */
  static async cancel(subscriptionId: string): Promise<void> {
    await prisma.dunningAttempt.updateMany({
      where: { subscriptionId, sentAt: null },
      data: { sentAt: new Date(), succeeded: false },
    });
  }

  private static subjectFor(emailType: string): string {
    const subjects: Record<string, string> = {
      soft_reminder: "We couldn't process your payment",
      urgent: "Action required — your subscription is on hold",
      final_notice: "Final notice — your account will be downgraded soon",
    };
    return subjects[emailType] ?? "Important notice about your account";
  }
}
