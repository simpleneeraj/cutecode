import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const publicPaths = [
  /^\/$/,
  /^\/pricing(\/.*)?$/,
  /^\/checkout\/success(\/.*)?$/,
  /^\/checkout\/failure(\/.*)?$/,
  /^\/api\/webhooks(\/.*)?$/,
  /^\/api\/trpc(\/.*)?$/,
  /^\/waitlist(\/.*)?$/,
  /^\/legal\/terms(\/.*)?$/,
  /^\/legal\/privacy(\/.*)?$/,
  /^\/legal\/refund(\/.*)?$/,
  /^\/embed(\/.*)?$/,
  /^\/icon(\/.*)?$/,
  /^\/sitemap\.xml$/,
  /^\/robots\.txt$/,
  /^\/api\/share-links(\/.*)?$/,
  /^\/api\/users(\/.*)?$/,
  /^\/account(\/.*)?$/,
  /^\/auth\/callback(\/.*)?$/,
  /^\/upgrade-to-pro(\/.*)?$/,
];

function isPublicPath(pathname: string) {
  return publicPaths.some((regex) => regex.test(pathname));
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isPublicPath(pathname)) {
    const url = new URL("/account/sign-in", request.url);
    url.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
