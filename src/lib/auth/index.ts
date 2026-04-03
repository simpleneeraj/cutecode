import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Plan, Role } from "@/generated/prisma/client";
import { isPlanAtLeast } from "@/lib/billing/plans";

/**
 * Get the DB user for the currently authenticated Clerk session.
 * Returns null if unauthenticated OR if the user has not been synced yet.
 * Safe to call in server components — will NOT redirect.
 */
export async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) return null;

  return prisma.user.findUnique({
    where: { clerkId: userId },
    include: { subscription: true },
  });
}

/**
 * Require authentication. Redirects to /sign-in if not authed.
 * Returns the full DB user record including subscription.
 */
export async function requireAuth() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { subscription: true },
  });

  // Edge case: Clerk authed but webhook hasn't created the DB user yet
  if (!user) redirect("/sign-in");

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
