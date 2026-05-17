/**
 * server/init.ts
 *
 * tRPC core — context, procedures, shared inputs.
 * Sub-routers MUST import from here (not trpc.ts) to avoid circular deps.
 */

import "server-only";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
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
    if (!isAuthenticated) return { user: null };

    const cacheKey = `user-ctx:${userId}`;
    let user = await cacheGet<User>(cacheKey);

    if (!user) {
      user = await prisma.user.findUnique({ where: { clerkId: userId } });
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
