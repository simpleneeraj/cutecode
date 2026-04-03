import { Webhooks } from "@dodopayments/nextjs";
import { prisma } from "@/lib/db";
import { Plan, SubscriptionStatus } from "@/generated/prisma/client";
import { syncPlanToClerk } from "@/lib/billing";

/**
 * Map DodoPayments product IDs → Plan enum values.
 * Update these when you create products in your DodoPayments dashboard.
 */
function getProductPlanMap(): Record<string, Plan> {
  return {
    [process.env.NEXT_PUBLIC_DODO_PRODUCT_PRO ?? ""]: Plan.PRO,
    [process.env.NEXT_PUBLIC_DODO_PRODUCT_ELITE ?? ""]: Plan.ELITE,
    [process.env.NEXT_PUBLIC_DODO_PRODUCT_ULTIMATE ?? ""]: Plan.ULTIMATE,
  };
}

type WebhookData = {
  subscription_id: string;
  customer: { email: string };
  product_id?: string;
  current_period_start?: string;
  current_period_end?: string;
};

type WebhookPayload = { data: WebhookData };

async function handleSubscriptionEvent(payload: WebhookPayload, status: SubscriptionStatus) {
  const { data } = payload;
  const productPlanMap = getProductPlanMap();

  // Active → resolve plan from product_id; any other status → downgrade to FREE
  const plan: Plan =
    status === SubscriptionStatus.ACTIVE && data.product_id
      ? (productPlanMap[data.product_id] ?? Plan.FREE)
      : Plan.FREE;

  const user = await prisma.user.findUnique({
    where: { email: data.customer.email },
    select: { id: true, clerkId: true },
  });

  if (!user) {
    console.warn(`[dodo-webhook] No user found for email ${data.customer.email}`);
    return;
  }

  const now = new Date();
  const periodStart = data.current_period_start ? new Date(data.current_period_start) : now;
  const periodEnd = data.current_period_end ? new Date(data.current_period_end) : now;

  // Atomic transaction: subscription record + user.plan updated together
  await prisma.$transaction([
    prisma.subscription.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        dodoSubscriptionId: data.subscription_id,
        plan,
        status,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
      },
      update: {
        plan,
        status,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: status === SubscriptionStatus.CANCELLED,
      },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { plan },
    }),
  ]);

  // Sync plan to Clerk publicMetadata for fast client-side access
  await syncPlanToClerk(user.clerkId, plan);
}

export const POST = Webhooks({
  webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY!,

  onSubscriptionActive: (p) => handleSubscriptionEvent(p as WebhookPayload, SubscriptionStatus.ACTIVE),
  onSubscriptionRenewed: (p) => handleSubscriptionEvent(p as WebhookPayload, SubscriptionStatus.ACTIVE),
  onSubscriptionPlanChanged: (p) => handleSubscriptionEvent(p as WebhookPayload, SubscriptionStatus.ACTIVE),
  onSubscriptionOnHold: (p) => handleSubscriptionEvent(p as WebhookPayload, SubscriptionStatus.ON_HOLD),
  onSubscriptionCancelled: (p) => handleSubscriptionEvent(p as WebhookPayload, SubscriptionStatus.CANCELLED),
  onSubscriptionFailed: (p) => handleSubscriptionEvent(p as WebhookPayload, SubscriptionStatus.FAILED),
  onSubscriptionExpired: (p) => handleSubscriptionEvent(p as WebhookPayload, SubscriptionStatus.EXPIRED),


  onPaymentSucceeded: async (payload: unknown) => {
    const data = (payload as { data: { customer: { email: string }; payment_id: string; subscription_id?: string } }).data;
    const user = await prisma.user.findUnique({
      where: { email: data.customer.email },
      select: { id: true },
    });
    if (!user) {
      console.warn(`[dodo-webhook] onPaymentSucceeded: no user for ${data.customer.email}`);
      return;
    }
    // Payment success is already handled by onSubscriptionActive/Renewed.
    // Log it here for your own records / analytics.
    console.info(`[dodo-webhook] Payment succeeded for user ${user.id} | payment_id=${data.payment_id}`);
  },

  onPaymentFailed: async (payload: unknown) => {
    const data = (payload as { data: { customer: { email: string }; payment_id: string; subscription_id?: string } }).data;
    const user = await prisma.user.findUnique({
      where: { email: data.customer.email },
      select: { id: true },
    });
    if (!user) {
      console.warn(`[dodo-webhook] onPaymentFailed: no user for ${data.customer.email}`);
      return;
    }
    // Mark subscription as FAILED so the UI can reflect it
    if (data.subscription_id) {
      await prisma.subscription.updateMany({
        where: { userId: user.id, dodoSubscriptionId: data.subscription_id },
        data: { status: SubscriptionStatus.FAILED },
      });
      // Sync plan downgrade to Clerk so client picks it up immediately
      const dbUser = await prisma.user.update({
        where: { id: user.id },
        data: { plan: Plan.FREE },
        select: { clerkId: true },
      });
      await syncPlanToClerk(dbUser.clerkId, Plan.FREE);
    }
    console.warn(`[dodo-webhook] Payment FAILED for user ${user.id} | payment_id=${data.payment_id}`);
  },
});
