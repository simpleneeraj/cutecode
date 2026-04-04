/**
 * DodoPayments webhook — REMOVED
 *
 * The app has migrated to Clerk Billing.
 * Subscription lifecycle is now managed by Clerk natively.
 *
 * For subscription-related events, use Clerk's webhook events:
 *   - user.updated  (plan changes are reflected in session claims)
 *
 * See: https://clerk.com/docs/guides/billing/overview
 */
import { NextResponse } from "next/server";

export function POST() {
  return NextResponse.json({ error: "DodoPayments webhooks are no longer used. App has migrated to Clerk Billing." }, { status: 410 });
}
