/**
 * Billing management is now handled natively by Clerk Billing.
 * Users manage their subscription via the Clerk <UserProfile /> component
 * or the /pricing page which renders <PricingTable />.
 *
 * This route is no longer needed and is kept only as a redirect for
 * any bookmarked URLs.
 */
import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.redirect(new URL("/pricing", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"));
}
