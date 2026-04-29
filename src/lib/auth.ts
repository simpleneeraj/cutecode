import { prisma } from "@/lib/db";
import { unauthorized } from "./response";
import { auth } from "@clerk/nextjs/server";
import type { NextResponse } from "next/server";
import type { User } from "@/generated/prisma/client";

type AuthOk   = { user: User; error: null };
type AuthFail = { user: null; error: NextResponse };

export async function requireAuth(): Promise<AuthOk | AuthFail> {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    console.log("[requireAuth] Missing clerkId");
    return { user: null, error: unauthorized() };
  }

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) {
    console.log("[requireAuth] Missing user in DB for clerkId:", clerkId);
    return { user: null, error: unauthorized() };
  }

  return { user, error: null };
}

/** Returns the DB user if authenticated, null otherwise. Never throws. */
export async function getCurrentUser(): Promise<User | null> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;
  return prisma.user.findUnique({ where: { clerkId } });
}
