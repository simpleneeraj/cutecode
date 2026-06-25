import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Plan, Role } from "@/generated/prisma/client";
import { isPlanAtLeast } from "@/lib/billing/plans";
import { createClient } from "@/lib/supabase/server";
import { ensureDbUser } from "@/lib/auth/sync";

/**
 * Get the DB user for the currently authenticated Supabase session.
 * Returns null if unauthenticated OR if the user has not been synced yet.
 * Safe to call in server components — will NOT redirect.
 */
export async function getCurrentUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser) return null;

    await ensureDbUser(authUser);

    return prisma.user.findUnique({
      where: { supabaseId: authUser.id },
      include: { subscription: true },
    });
  } catch (err) {
    console.error("[getCurrentUser] Error fetching user:", err);
    return null;
  }
}

/**
 * Require authentication. Redirects to /account/sign-in if not authed.
 * Returns the full DB user record including subscription.
 */
export async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) redirect("/account/sign-in");

  await ensureDbUser(authUser);

  const user = await prisma.user.findUnique({
    where: { supabaseId: authUser.id },
    include: { subscription: true },
  });

  // Edge case: Supabase authed but database user hasn't been created yet
  if (!user) redirect("/account/sign-in");

  return user;
}

/**
 * Require a specific role. Throws if role doesn't match.
 * Use inside Server Actions / API routes.
 */
export async function requireRole(role: Role) {
  const user = await requireAuth();
  if (user.role !== role) {
    throw new Error(`Forbidden: requires role "${role}"`);
  }
  return user;
}

/**
 * Require at least the specified subscription plan.
 * Redirects to /pricing if the user's plan is insufficient.
 */
export async function requireSubscription(plan: Plan) {
  const user = await requireAuth();
  if (!isPlanAtLeast(user.plan, plan)) {
    redirect("/pricing");
  }
  return user;
}
