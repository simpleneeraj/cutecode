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

import { z } from "zod";
import { prisma } from "@/lib/db";
import { TRPCError } from "@trpc/server";
import { type Prisma } from "@/generated/prisma/client";
import { router, protectedProcedure, paginationInput } from "../init";
import { createPresentationSchema, syncPresentationSchema } from "@/lib/schemas";

export const presentationRouter = router({
  /**
   * List presentations
   * @param page - Page number
   * @param limit - Items per page
   * @returns List of presentations
   * @throws TRPCError
   */
  list: protectedProcedure.input(paginationInput).query(async ({ ctx, input }) => {
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

  /**
   * Get presentation
   * @param id - Presentation id
   * @returns Presentation
   * @throws TRPCError
   */
  get: protectedProcedure.input(z.object({ id: z.string().min(1) })).query(async ({ ctx, input }) => {
    const presentation = await prisma.presentation.findFirst({
      where: { id: input.id, userId: ctx.user.id },
    });

    if (!presentation) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Presentation not found" });
    }

    return presentation;
  }),

  /**
   * Create presentation
   * @param name - Presentation name
   * @param width - Presentation width
   * @param slides - Presentation slides
   * @param elements - Presentation elements
   * @param slideElements - Presentation slide elements
   * @returns Created presentation
   * @throws TRPCError
   */
  create: protectedProcedure.input(createPresentationSchema).mutation(async ({ ctx, input }) => {
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

  /**
   * Sync presentation
   * @param id - Presentation id
   * @param data - Presentation data
   * @returns Updated presentation
   * @throws TRPCError
   */
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

  /**
   * Delete presentation
   * @param id - Presentation id
   * @returns Deleted presentation
   * @throws TRPCError
   */
  delete: protectedProcedure.input(z.object({ id: z.string().min(1) })).mutation(async ({ ctx, input }) => {
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
