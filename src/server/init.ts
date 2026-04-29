/**
 * server/init.ts
 *
 * tRPC core — context, procedures, shared inputs.
 * Sub-routers MUST import from here (not trpc.ts) to avoid circular deps.
 */

import "server-only";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { initTRPC, TRPCError } from "@trpc/server";
import type { User } from "@/generated/prisma/client";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";

// ─── Context ──────────────────────────────────────────────────────────────────

export type Context = {
  user: User | null;
};

export async function createContext({ req }: FetchCreateContextFnOptions): Promise<Context> {
  try {
    const { userId: clerkId } = getAuth(req as NextRequest);

    if (!clerkId) return { user: null };

    const user = await prisma.user.findUnique({ where: { clerkId } });
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

// ─── Shared inputs ────────────────────────────────────────────────────────────

export const paginationInput = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});
