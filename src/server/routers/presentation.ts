/**
 * server/routers/presentation.ts
 *
 * All presentation-related tRPC procedures.
 *
 * Procedures:
 *   presentation.list   — paginated list (owner only)
 *   presentation.get    — single presentation (owner only)
 *   presentation.create — create a new presentation
 *   presentation.sync   — patch slides / elements / metadata
 *   presentation.delete — hard-delete (owner only)
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { type Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { router, protectedProcedure, paginationInput } from "../init";
import {
  createPresentationSchema,
  syncPresentationSchema,
} from "@/lib/schemas";

export const presentationRouter = router({
  // ── list ────────────────────────────────────────────────────────────────
  list: protectedProcedure
    .input(paginationInput)
    .query(async ({ ctx, input }) => {
      const { page, limit } = input;
      const skip = (page - 1) * limit;

      const [presentations, total] = await prisma.$transaction([
        prisma.presentation.findMany({
          where: { userId: ctx.user.id },
          select: {
            id: true,
            name: true,
            width: true,
            isPublic: true,
            thumbnailUrl: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { updatedAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.presentation.count({ where: { userId: ctx.user.id } }),
      ]);

      return { presentations, total, page, limit };
    }),

  // ── get ─────────────────────────────────────────────────────────────────
  get: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const presentation = await prisma.presentation.findFirst({
        where: { id: input.id, userId: ctx.user.id },
      });

      if (!presentation) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Presentation not found" });
      }

      return presentation;
    }),

  // ── create ──────────────────────────────────────────────────────────────
  create: protectedProcedure
    .input(createPresentationSchema)
    .mutation(async ({ ctx, input }) => {
      return prisma.presentation.create({
        data: {
          userId: ctx.user.id,
          name: input.name,
          width: input.width,
          slides: input.slides as Prisma.InputJsonValue,
          elements: input.elements as Prisma.InputJsonValue,
          slideElements: input.slideElements as Prisma.InputJsonValue,
        },
      });
    }),

  // ── sync ─────────────────────────────────────────────────────────────────
  sync: protectedProcedure
    .input(z.object({ id: z.string().min(1), data: syncPresentationSchema }))
    .mutation(async ({ ctx, input }) => {
      const existing = await prisma.presentation.findFirst({
        where: { id: input.id, userId: ctx.user.id },
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Presentation not found" });
      }

      return prisma.presentation.update({
        where: { id: input.id },
        data: {
          ...(input.data.name && { name: input.data.name }),
          ...(input.data.width && { width: input.data.width }),
          slides: input.data.slides as Prisma.InputJsonValue,
          elements: input.data.elements as Prisma.InputJsonValue,
          slideElements: input.data.slideElements as Prisma.InputJsonValue,
        },
      });
    }),

  // ── delete ──────────────────────────────────────────────────────────────
  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const existing = await prisma.presentation.findFirst({
        where: { id: input.id, userId: ctx.user.id },
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Presentation not found" });
      }

      await prisma.presentation.delete({ where: { id: input.id } });
      return { deleted: true, id: input.id };
    }),
});
