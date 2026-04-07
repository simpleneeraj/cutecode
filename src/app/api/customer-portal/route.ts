import { NextRequest, NextResponse } from "next/server";
import { CustomerPortal } from "@dodopayments/nextjs";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

const dodoHandler = CustomerPortal({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
  environment: process.env.DODO_PAYMENTS_ENVIRONMENT as "test_mode" | "live_mode",
});

export const GET = async (req: NextRequest) => {
  const { userId } = await auth();

  console.log("USER ID", userId);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { subscription: true },
  });

  const customerId = user?.subscription?.dodoCustomerId;

  if (!customerId) {
    logger.warn({ userId }, "Failed to open portal: No Dodo customer ID found for user");
    return NextResponse.json({ error: "No customer ID found for this user." }, { status: 400 });
  }

  // Clone the request and inject the customer_id query parameter so Dodo's SDK can read it
  const url = new URL(req.url);
  url.searchParams.set("customer_id", customerId);
  const newReq = new NextRequest(url, req);

  // Call Dodo's SDK
  const dodoResponse = (await dodoHandler(newReq)) as Response;

  // Dodo's SDK returns an HTTP redirect to the portal.
  // Our frontend uses fetch(), which gets blocked by CORS if it follows a redirect to a different origin.
  // Instead, we catch the redirect URL and return it as JSON to match use-billing.ts expectations.
  if (dodoResponse.status >= 300 && dodoResponse.status < 400) {
    const portalUrl = dodoResponse.headers.get("location");
    if (portalUrl) {
      return NextResponse.json({ customer_portal_url: portalUrl });
    }
  }

  return dodoResponse;
};
