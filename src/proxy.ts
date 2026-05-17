import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
/**
 * Public routes — no authentication required.
 * Webhook routes MUST be public or Clerk will block the incoming requests.
 */
const isPublicRoute = createRouteMatcher([
  "/",
  "/pricing(.*)",
  "/checkout/success(.*)",
  "/checkout/failure(.*)",
  "/api/webhooks/(.*)",
  "/api/checkout(.*)",
  "/api/trpc(.*)",
  "/waitlist(.*)",
  "/legal/terms(.*)",
  "/legal/privacy(.*)",
  "/legal/refund(.*)",
  "/embed(.*)",
  "/icon(.*)",
  "/sitemap.xml",
  "/robots.txt",
  "/api/share-links/(.*)",
  "/api/users/(.*)",
  "/account(.*)",
  "/upgrade-to-pro(.*)",
]);

const isProRoute = createRouteMatcher([
  // "/explore(.*)", "/snippets(.*)",
  // "/preview(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProRoute(req)) {
    const authObject = await auth();
    if (!authObject.userId) {
      await auth.protect();
    }

    // const publicMetadata = (authObject.sessionClaims?.publicMetadata as any) || {};
    // const plan = publicMetadata?.plan || Plan.FREE;
    // const subscriptionStatus = publicMetadata?.subscriptionStatus || SubscriptionStatus.ACTIVE;

    // const isExpired =
    // subscriptionStatus === SubscriptionStatus.EXPIRED || subscriptionStatus === SubscriptionStatus.UNPAID;
    // const isPro = (plan === Plan.PRO || plan === Plan.ELITE || plan === Plan.ULTIMATE) && !isExpired;

    // if (!isPro) {
    //   return NextResponse.redirect(new URL("/upgrade-to-pro", req.url));
    // }
  } else if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
