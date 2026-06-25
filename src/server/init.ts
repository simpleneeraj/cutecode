/**
 * server/init.ts
 *
 * tRPC core — context, procedures, shared inputs.
 * Sub-routers MUST import from here (not trpc.ts) to avoid circular deps.
 */

import "server-only";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
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
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser) return { user: null };

    const userId = authUser.id;
    const cacheKey = `user-ctx:${userId}`;
    let user = await cacheGet<User>(cacheKey);

    if (!user) {
      user = await prisma.user.findUnique({ where: { supabaseId: userId } });

      // ── Just-in-time provisioning ─────────────────────────────────────────
      // If the user is authenticated in Supabase but missing from our DB,
      // upsert from the metadata.
      if (!user) {
        try {
          const email = authUser.email ?? "";
          const name = authUser.user_metadata?.full_name || authUser.user_metadata?.name || undefined;

          try {
            user = await prisma.user.upsert({
              where: { supabaseId: userId },
              create: { supabaseId: userId, email, name: name ?? null },
              update: { email, name: name ?? null },
            });
          } catch (upsertErr: any) {
            // P2002 = unique constraint violation — a concurrent request already
            // created this user between our findUnique and this upsert. That's
            // fine; just fetch the row that now exists.
            if (upsertErr?.code === "P2002") {
              user = await prisma.user.findUnique({ where: { supabaseId: userId } });
            } else {
              throw upsertErr;
            }
          }
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
