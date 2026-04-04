/**
 * Checkout is now handled natively by Clerk Billing via the <PricingTable /> component.
 * No custom checkout route is needed. This file is kept as a stub.
 */
import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.redirect(new URL("/pricing", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"));
}

export function POST() {
  return NextResponse.json({ error: "Use Clerk Billing PricingTable for checkout." }, { status: 410 });
}
