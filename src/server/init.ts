/**
 * server/init.ts
 *
 * tRPC core — context, procedures, shared inputs.
 * Sub-routers MUST import from here (not trpc.ts) to avoid circular deps.
 */

import "server-only";
import { z } from "zod";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { cacheGet, cacheSet } from "@/lib/redis";
import { initTRPC, TRPCError } from "@trpc/server";
import type { User } from "@/generated/prisma/client";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";

/**
 * Context type
 */
export type Context = {
  user: User | null;
};

/**
 * Create context for tRPC
 * @param req
 * @returns
 */
export async function createContext({ req }: FetchCreateContextFnOptions): Promise<Context> {
  try {
    const { isAuthenticated, userId } = await auth();
    if (!isAuthenticated || !userId) return { user: null };

    const cacheKey = `user-ctx:${userId}`;
    let user = await cacheGet<User>(cacheKey);

    if (!user) {
      user = await prisma.user.findUnique({ where: { clerkId: userId } });

      // ── Just-in-time provisioning ─────────────────────────────────────────
      // If the user is authenticated in Clerk but missing from our DB it means
      // the `user.created` webhook was missed (not configured at sign-up time,
      // or a delivery failure). We fetch from Clerk and upsert now so the user
      // is never permanently blocked from using the app.
      if (!user) {
        try {
          const clerk = await clerkClient();
          const clerkUser = await clerk.users.getUser(userId);
          const primaryEmail =
            clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)
              ?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress ?? "";
          const name =
            [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || undefined;

          user = await prisma.user.upsert({
            where: { clerkId: userId },
            create: { clerkId: userId, email: primaryEmail, name: name ?? null },
            update: { email: primaryEmail, name: name ?? null },
          });
        } catch (provisionErr) {
          console.error("[tRPC] JIT user provisioning failed:", provisionErr);
          return { user: null };
        }
      }

      if (user) {
        await cacheSet(cacheKey, user, 60 * 30); // Cache for 30 minutes
      }
    }

    return { user };
  } catch (e) {
    console.error(e);
    return { user: null };
  }
}
const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { user: ctx.user } });
});

/**
 * Pagination input
 */
export const paginationInput = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});
