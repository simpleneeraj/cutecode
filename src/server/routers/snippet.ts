/**
 * server/routers/snippet.ts
 *
 * All snippet-related tRPC procedures.
 *
 * Procedures:
 *   snippet.list         — paginated list of the caller's snippets
 *   snippet.explore      — paginated public explore feed (no auth)
 *   snippet.get          — single snippet with resolved element
 *   snippet.create       — create a snippet tied to a presentation element
 *   snippet.update       — patch title / isPublic
 *   snippet.delete       — hard-delete (owner only)
 *   snippet.toggleUpvote — toggle upvote (auth required)
 *   snippet.toggleBookmark — toggle bookmark (auth required)
 *   snippet.listComments — paginated public comments
 *   snippet.addComment   — add a comment (auth required)
 *   snippet.remix        — fork a public snippet into the caller's account
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { router, protectedProcedure, publicProcedure, paginationInput } from "../init";
import { createSnippetSchema, updateSnippetSchema } from "@/lib/schemas";
import { socialRateLimit, commentRateLimit, checkRateLimit, cacheDel } from "@/lib/redis";
import { ShareVisibility } from "@/generated/prisma/enums";

export const snippetRouter = router({
  /**
   * List all snippets of a user
   * @param input
   *
   * @returns
   */
  list: protectedProcedure.input(paginationInput).query(async ({ ctx, input }) => {
    const { page, limit } = input;
    const skip = (page - 1) * limit;

    const [snippets, total] = await prisma.$transaction([
      prisma.snippet.findMany({
        where: { userId: ctx.user.id },
        include: {
          presentation: { select: { id: true, name: true } },
          shareLinks: { select: { slug: true, visibility: true }, take: 1, orderBy: { createdAt: "asc" } },
          _count: { select: { upvotes: true, bookmarks: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.snippet.count({ where: { userId: ctx.user.id } }),
    ]);

    return { snippets, total, page, limit };
  }),

  /** Public explore feed — paginated, filterable by language or sort order */
  explore: publicProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(48).default(24),
        sort: z.enum(["recent", "popular"]).default("recent"),
        language: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      const { page, limit, sort, language } = input;
      const skip = (page - 1) * limit;

      const where = {
        isPublic: true,
        shareLinks: {
          some: { visibility: ShareVisibility.PUBLIC },
        },
        ...(language ? { presentation: { elements: { path: ["language"], equals: language } } } : {}),
      };

      const orderBy =
        sort === "popular"
          ? { upvotes: { _count: "desc" as const } }
          : { createdAt: "desc" as const };

      const [snippets, total] = await prisma.$transaction([
        prisma.snippet.findMany({
          where,
          orderBy,
          skip,
          take: limit,
          select: {
            id: true,
            title: true,
            description: true,
            tags: true,
            createdAt: true,
            elementId: true,
            user: { select: { id: true, name: true } },
            presentation: { select: { id: true, name: true, elements: true } },
            shareLinks: {
              where: { visibility: ShareVisibility.PUBLIC },
              select: { slug: true },
              take: 1,
              orderBy: { createdAt: "asc" },
            },
            _count: { select: { upvotes: true, bookmarks: true, comments: true } },
          },
        }),
        prisma.snippet.count({ where }),
      ]);

      return { snippets, total, page, limit };
    }),

  /**
   * Get a snippet
   * @param input
   *
   * @returns
   */
  get: protectedProcedure.input(z.object({ id: z.string().min(1) })).query(async ({ ctx, input }) => {
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

  /**
   * Create a snippet
   * @param input
   *
   * @returns
   */
  create: protectedProcedure.input(createSnippetSchema).mutation(async ({ ctx, input }) => {
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
        tags: input.tags ?? [],
        isPublic: input.isPublic ?? false,
      },
    });
  }),

  /**
   * Update a snippet
   * @param input
   *
   * @returns
   */
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

  /**
   * Delete a snippet
   * @param input
   *
   * @returns
   */
  delete: protectedProcedure.input(z.object({ id: z.string().min(1) })).mutation(async ({ ctx, input }) => {
    const existing = await prisma.snippet.findFirst({
      where: { id: input.id, userId: ctx.user.id },
    });

    if (!existing) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Snippet not found" });
    }

    await prisma.snippet.delete({ where: { id: input.id } });
    return { deleted: true, id: input.id };
  }),

  /**
   * Toggle upvote a snippet
   * @param input
   *
   * @returns
   */
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

      const shareLinks = await prisma.shareLink.findMany({ where: { snippetId }, select: { slug: true } });
      const bustCache = () => Promise.all(shareLinks.map(({ slug }) => cacheDel(`shareLink:${slug}`)));

      const existing = await prisma.snippetUpvote.findUnique({
        where: { snippetId_userId: { snippetId, userId: ctx.user.id } },
      });

      if (existing) {
        await prisma.snippetUpvote.delete({ where: { id: existing.id } });
        await bustCache();
        const count = await prisma.snippetUpvote.count({ where: { snippetId } });
        return { upvoted: false, count };
      }

      await prisma.snippetUpvote.create({ data: { snippetId, userId: ctx.user.id } });
      await bustCache();
      const count = await prisma.snippetUpvote.count({ where: { snippetId } });
      return { upvoted: true, count };
    }),

  /**
   * Toggle bookmark a snippet
   * @param input
   *
   * @returns
   */
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

      const shareLinks = await prisma.shareLink.findMany({ where: { snippetId }, select: { slug: true } });
      const bustCache = () => Promise.all(shareLinks.map(({ slug }) => cacheDel(`shareLink:${slug}`)));

      const existing = await prisma.snippetBookmark.findUnique({
        where: { snippetId_userId: { snippetId, userId: ctx.user.id } },
      });

      if (existing) {
        await prisma.snippetBookmark.delete({ where: { id: existing.id } });
        await bustCache();
        const count = await prisma.snippetBookmark.count({ where: { snippetId } });
        return { bookmarked: false, count };
      }

      await prisma.snippetBookmark.create({ data: { snippetId, userId: ctx.user.id } });
      await bustCache();
      const count = await prisma.snippetBookmark.count({ where: { snippetId } });
      return { bookmarked: true, count };
    }),

  /**
   * List comments on a snippet
   * @param input
   *
   * @returns
   */
  listComments: publicProcedure
    .input(
      z.object({
        snippetId: z.string().min(1),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      const take = 20;
      const comments = await prisma.snippetComment.findMany({
        where: { snippetId: input.snippetId },
        orderBy: { createdAt: "desc" },
        take,
        ...(input.cursor ? { skip: 1, cursor: { id: input.cursor } } : {}),
        include: { user: { select: { id: true, name: true } } },
      });

      const nextCursor = comments.length === take ? comments[comments.length - 1].id : null;
      return { comments, nextCursor };
    }),

  /**
   * Add a comment to a snippet
   * @param input
   *
   * @returns
   */
  addComment: protectedProcedure
    .input(
      z.object({
        snippetId: z.string().min(1),
        content: z.string().min(1).max(2000),
      }),
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
        include: { user: { select: { id: true, name: true } } },
      });
    }),

  /**
   * Remix a snippet
   * @param input
   *
   * @returns
   */
  remix: protectedProcedure.input(z.object({ slug: z.string().min(1) })).mutation(async ({ ctx, input }) => {
    const shareLink = await prisma.shareLink.findUnique({
      where: { slug: input.slug },
      include: { snippet: { include: { presentation: true } } },
    });

    if (!shareLink || !shareLink.snippet) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Snippet not found" });
    }

    if (shareLink.visibility !== ShareVisibility.PUBLIC) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Can only remix public snippets" });
    }

    const snippet = shareLink.snippet;
    const presentation = snippet.presentation;

    const newPresentation = await prisma.presentation.create({
      data: {
        userId: ctx.user.id,
        name: `${presentation.name} (Remixed)`,
        width: presentation.width,
        slides: presentation.slides ?? {},
        elements: presentation.elements ?? {},
        slideElements: presentation.slideElements ?? {},
      },
    });

    const newSnippet = await prisma.snippet.create({
      data: {
        userId: ctx.user.id,
        presentationId: newPresentation.id,
        elementId: snippet.elementId,
        title: snippet.title ? `${snippet.title} (Remixed)` : undefined,
        description: snippet.description,
        tags: snippet.tags,
        isPublic: true,
      },
    });

    const { nanoid } = await import("nanoid");
    const newSlug = nanoid(8);
    await prisma.shareLink.create({
      data: {
        userId: ctx.user.id,
        slug: newSlug,
        targetType: "SNIPPET",
        targetId: newSnippet.id,
        snippetId: newSnippet.id,
        presentationId: newPresentation.id,
        visibility: ShareVisibility.PUBLIC,
      },
    });

    return { slug: newSlug };
  }),
});
