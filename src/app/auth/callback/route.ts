import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * OAuth / email-link callback.
 * Exchanges the `code` for a session, then redirects to `redirectedFrom` (or "/").
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // `next` (e.g. password recovery) takes precedence over `redirectedFrom`.
  const destination = searchParams.get("next") || searchParams.get("redirectedFrom") || "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  return NextResponse.redirect(`${origin}/account/sign-in?error=auth_callback_failed`);
}
