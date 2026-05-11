import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Public routes — no authentication required.
 * Webhook routes MUST be public or Clerk will block the incoming requests.
 */
const isPublicRoute = createRouteMatcher([
  "/",
  "/pricing(.*)",
  "/checkout/success(.*)",
  "/api/webhooks/(.*)",
  "/api/checkout(.*)",
  "/api/trpc(.*)",
  "/waitlist(.*)",
  "/legal/terms(.*)",
  "/legal/privacy(.*)",
  "/legal/refund(.*)",
  "/explore(.*)",
  "/snippets(.*)",
  "/preview(.*)",
  "/embed(.*)",
  "/icon(.*)",
  "/sitemap.xml",
  "/robots.txt",
  "/api/share-links/(.*)",
  "/api/users/(.*)",
  "/account(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
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
