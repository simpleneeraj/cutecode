import { prisma } from "@/lib/db";
import { unauthorized } from "./response";
import { createClient } from "@/lib/supabase/server";
import { ensureDbUser } from "@/lib/auth/sync";
import type { NextResponse } from "next/server";
import type { User } from "@/generated/prisma/client";

type AuthOk = { user: User; error: null };
type AuthFail = { user: null; error: NextResponse };

export async function requireAuth(): Promise<AuthOk | AuthFail> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    console.log("[requireAuth] Missing authenticated user");
    return { user: null, error: unauthorized() };
  }

  await ensureDbUser(authUser);

  const user = await prisma.user.findUnique({ where: { supabaseId: authUser.id } });
  if (!user) {
    console.log("[requireAuth] Missing user in DB for supabaseId:", authUser.id);
    return { user: null, error: unauthorized() };
  }

  return { user, error: null };
}

/** Returns the DB user if authenticated, null otherwise. Never throws. */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser) return null;
    await ensureDbUser(authUser);
    return prisma.user.findUnique({ where: { supabaseId: authUser.id } });
  } catch (err) {
    console.error("[getCurrentUser] Error fetching user:", err);
    return null;
  }
}
