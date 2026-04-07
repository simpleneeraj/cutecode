"use server";

import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { CustomerPortal, Checkout } from "@dodopayments/nextjs";

export async function createCustomerPortalAction() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { subscription: true },
  });

  const customerId = user?.subscription?.dodoCustomerId;
  if (!customerId) {
    logger.warn({ userId }, "Failed to open portal via Server Action: No Dodo customer ID found.");
    throw new Error("No customer ID found");
  }

  // Use Dodo's helper to securely generate the portal URL
  const dodoHandler = CustomerPortal({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
    environment: process.env.DODO_PAYMENTS_ENVIRONMENT as "test_mode" | "live_mode",
  });

  // Mock standard Request to satisfy the helper's requirements
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const req = new NextRequest(`${baseUrl}/?customer_id=${customerId}`);
  const dodoResponse = (await dodoHandler(req)) as Response;

  if (dodoResponse.status >= 300 && dodoResponse.status < 400) {
    const portalUrl = dodoResponse.headers.get("location");
    if (portalUrl) {
      return portalUrl;
    }
  }

  throw new Error("Failed to create portal session response.");
}

export async function createCheckoutAction(productId: string) {
  // Use Dodo's helper to create the checkout URL
  const dodoHandler = Checkout({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
    returnUrl: process.env.DODO_PAYMENTS_RETURN_URL,
    environment: process.env.DODO_PAYMENTS_ENVIRONMENT as "test_mode" | "live_mode",
    type: "static",
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const req = new NextRequest(`${baseUrl}/?productId=${productId}`);
  const dodoResponse = (await dodoHandler(req)) as Response;

  if (!dodoResponse.ok) {
    throw new Error("Checkout fetch failed via Dodo helper.");
  }

  const { checkout_url } = await dodoResponse.json();
  if (checkout_url) {
    return checkout_url;
  }

  throw new Error("No checkout URL returned.");
}
