/**
 * server/routers/snippet.ts
 *
 * All snippet-related tRPC procedures.
 *
 * Procedures:
 *   snippet.list         — paginated list of the caller's snippets
 *   snippet.get          — single snippet with resolved element
 *   snippet.create       — create a snippet tied to a presentation element
 *   snippet.update       — patch title / isPublic
 *   snippet.delete       — hard-delete (owner only)
 *   snippet.toggleUpvote — toggle upvote (auth required)
 *   snippet.toggleBookmark — toggle bookmark (auth required)
 *   snippet.listComments — paginated public comments
 *   snippet.addComment   — add a comment (auth required)
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { router, protectedProcedure, publicProcedure, paginationInput } from "../init";
import { createSnippetSchema, updateSnippetSchema } from "@/lib/schemas";
import {
  socialRateLimit,
  commentRateLimit,
  checkRateLimit,
  cacheDel,
} from "@/lib/redis";

export const snippetRouter = router({
  // ── list ────────────────────────────────────────────────────────────────
  list: protectedProcedure
    .input(paginationInput)
    .query(async ({ ctx, input }) => {
      const { page, limit } = input;
      const skip = (page - 1) * limit;

      const [snippets, total] = await prisma.$transaction([
        prisma.snippet.findMany({
          where: { userId: ctx.user.id },
          include: { presentation: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.snippet.count({ where: { userId: ctx.user.id } }),
      ]);

      return { snippets, total, page, limit };
    }),

  // ── get ─────────────────────────────────────────────────────────────────
  get: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const snippet = await prisma.snippet.findFirst({
        where: { id: input.id, userId: ctx.user.id },
        include: {
          presentation: {
            select: { id: true, name: true, elements: true },
          },
        },
      });

      if (!snippet) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Snippet not found" });
      }

      const elements = snippet.presentation.elements as Record<string, unknown>;
      const element = elements[snippet.elementId] ?? null;

      return { ...snippet, element };
    }),

  // ── create ──────────────────────────────────────────────────────────────
  create: protectedProcedure
    .input(createSnippetSchema)
    .mutation(async ({ ctx, input }) => {
      const presentation = await prisma.presentation.findFirst({
        where: { id: input.presentationId, userId: ctx.user.id },
      });

      if (!presentation) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Presentation not found" });
      }

      const elements = presentation.elements as Record<string, unknown>;
      if (!elements[input.elementId]) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Element not found in presentation" });
      }

      return prisma.snippet.create({
        data: {
          userId: ctx.user.id,
          presentationId: input.presentationId,
          elementId: input.elementId,
          title: input.title,
          isPublic: input.isPublic ?? false,
        },
      });
    }),

  // ── update ──────────────────────────────────────────────────────────────
  update: protectedProcedure
    .input(z.object({ id: z.string().min(1), data: updateSnippetSchema }))
    .mutation(async ({ ctx, input }) => {
      const existing = await prisma.snippet.findFirst({
        where: { id: input.id, userId: ctx.user.id },
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Snippet not found" });
      }

      return prisma.snippet.update({ where: { id: input.id }, data: input.data });
    }),

  // ── delete ──────────────────────────────────────────────────────────────
  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const existing = await prisma.snippet.findFirst({
        where: { id: input.id, userId: ctx.user.id },
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Snippet not found" });
      }

      await prisma.snippet.delete({ where: { id: input.id } });
      return { deleted: true, id: input.id };
    }),

  // ── toggleUpvote ─────────────────────────────────────────────────────────
  toggleUpvote: protectedProcedure
    .input(z.object({ snippetId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { snippetId } = input;

      const { success } = await checkRateLimit(socialRateLimit, `upvote:${ctx.user.id}`);
      if (!success) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many requests. Slow down." });
      }

      const snippet = await prisma.snippet.findUnique({ where: { id: snippetId } });
      if (!snippet) throw new TRPCError({ code: "NOT_FOUND", message: "Snippet not found" });

      const existing = await prisma.snippetUpvote.findUnique({
        where: { snippetId_userId: { snippetId, userId: ctx.user.id } },
      });

      if (existing) {
        await prisma.snippetUpvote.delete({ where: { id: existing.id } });
        await cacheDel(`shareLink:${snippetId}`);
        const count = await prisma.snippetUpvote.count({ where: { snippetId } });
        return { upvoted: false, count };
      }

      await prisma.snippetUpvote.create({ data: { snippetId, userId: ctx.user.id } });
      await cacheDel(`shareLink:${snippetId}`);
      const count = await prisma.snippetUpvote.count({ where: { snippetId } });
      return { upvoted: true, count };
    }),

  // ── toggleBookmark ───────────────────────────────────────────────────────
  toggleBookmark: protectedProcedure
    .input(z.object({ snippetId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { snippetId } = input;

      const { success } = await checkRateLimit(socialRateLimit, `bookmark:${ctx.user.id}`);
      if (!success) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many requests. Slow down." });
      }

      const snippet = await prisma.snippet.findUnique({ where: { id: snippetId } });
      if (!snippet) throw new TRPCError({ code: "NOT_FOUND", message: "Snippet not found" });

      const existing = await prisma.snippetBookmark.findUnique({
        where: { snippetId_userId: { snippetId, userId: ctx.user.id } },
      });

      if (existing) {
        await prisma.snippetBookmark.delete({ where: { id: existing.id } });
        await cacheDel(`shareLink:${snippetId}`);
        const count = await prisma.snippetBookmark.count({ where: { snippetId } });
        return { bookmarked: false, count };
      }

      await prisma.snippetBookmark.create({ data: { snippetId, userId: ctx.user.id } });
      await cacheDel(`shareLink:${snippetId}`);
      const count = await prisma.snippetBookmark.count({ where: { snippetId } });
      return { bookmarked: true, count };
    }),

  // ── listComments ─────────────────────────────────────────────────────────
  listComments: publicProcedure
    .input(
      z.object({
        snippetId: z.string().min(1),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const take = 20;
      const comments = await prisma.snippetComment.findMany({
        where: { snippetId: input.snippetId },
        orderBy: { createdAt: "desc" },
        take,
        ...(input.cursor ? { skip: 1, cursor: { id: input.cursor } } : {}),
        include: { user: { select: { id: true, name: true, clerkId: true } } },
      });

      const nextCursor = comments.length === take ? comments[comments.length - 1].id : null;
      return { comments, nextCursor };
    }),

  // ── addComment ───────────────────────────────────────────────────────────
  addComment: protectedProcedure
    .input(
      z.object({
        snippetId: z.string().min(1),
        content: z.string().min(1).max(2000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { success } = await checkRateLimit(commentRateLimit, `comment:${ctx.user.id}`);
      if (!success) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many comments. Slow down." });
      }

      const snippet = await prisma.snippet.findUnique({ where: { id: input.snippetId } });
      if (!snippet) throw new TRPCError({ code: "NOT_FOUND", message: "Snippet not found" });

      return prisma.snippetComment.create({
        data: { snippetId: input.snippetId, userId: ctx.user.id, content: input.content.trim() },
        include: { user: { select: { id: true, name: true, clerkId: true } } },
      });
    }),
});
