/**
 * server/routers/shareLink.ts
 *
 * All share-link-related tRPC procedures.
 *
 * Procedures:
 *   shareLink.list      — owner's links, optionally filtered by snippetId / presentationId
 *   shareLink.update    — patch visibility / passcode / expiry etc.
 *   shareLink.delete    — hard-delete (owner only)
 *   shareLink.create    — create a new share link
 *   shareLink.preview   — public preview (passcode-gated if needed)
 *   shareLink.analytics — view count + sparkline data (owner only)
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/db";
import { router, protectedProcedure, publicProcedure } from "../init";
import { createShareLinkSchema, updateShareLinkSchema } from "@/lib/schemas";
import { apiRateLimit, cacheGet, cacheSet, checkRateLimit } from "@/lib/redis";

const SHARE_LINK_SELECT = {
  id: true,
  slug: true,
  visibility: true,
  isE2EEncrypted: true,
  encryptionHint: true,
  maxViews: true,
  viewCount: true,
  expiresAt: true,
  allowDownload: true,
  allowCopy: true,
  indexable: true,
  snippetId: true,
  presentationId: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const shareLinkRouter = router({
  // ── list ────────────────────────────────────────────────────────────────
  list: protectedProcedure
    .input(
      z.object({
        snippetId: z.string().optional(),
        presentationId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const links = await prisma.shareLink.findMany({
        where: {
          userId: ctx.user.id,
          ...(input.snippetId && { snippetId: input.snippetId }),
          ...(input.presentationId && { presentationId: input.presentationId }),
        },
        select: SHARE_LINK_SELECT,
        orderBy: { createdAt: "desc" },
      });

      return links;
    }),

  // ── create ──────────────────────────────────────────────────────────────
  create: protectedProcedure
    .input(createShareLinkSchema)
    .mutation(async ({ ctx, input }) => {
      const { snippetId, presentationId, visibility, passcode, isE2EEncrypted, encryptionHint, maxViews, expiresAt, allowDownload, allowCopy } = input;

      // Verify ownership of the target
      if (snippetId) {
        const snippet = await prisma.snippet.findFirst({ where: { id: snippetId, userId: ctx.user.id } });
        if (!snippet) throw new TRPCError({ code: "BAD_REQUEST", message: "Snippet not found" });
      }

      if (presentationId) {
        const presentation = await prisma.presentation.findFirst({ where: { id: presentationId, userId: ctx.user.id } });
        if (!presentation) throw new TRPCError({ code: "BAD_REQUEST", message: "Presentation not found" });
      }

      const passcodeHash = passcode ? await bcrypt.hash(passcode, 10) : undefined;

      // Generate unique slug (retry once on collision)
      let slug = nanoid(8);
      const existing = await prisma.shareLink.findUnique({ where: { slug } });
      if (existing) slug = nanoid(8);

      return prisma.shareLink.create({
        data: {
          userId: ctx.user.id,
          slug,
          targetType: snippetId ? "SNIPPET" : presentationId ? "PRESENTATION" : "COLLECTION",
          targetId: snippetId ?? presentationId ?? "",
          snippetId: snippetId ?? null,
          presentationId: presentationId ?? null,
          visibility,
          passcodeHash: passcodeHash ?? null,
          isE2EEncrypted,
          encryptionHint: encryptionHint ?? null,
          maxViews: maxViews ?? null,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          allowDownload,
          allowCopy,
          indexable: visibility === "PUBLIC",
        },
        select: SHARE_LINK_SELECT,
      });
    }),

  // ── update ──────────────────────────────────────────────────────────────
  update: protectedProcedure
    .input(z.object({ id: z.string().min(1), data: updateShareLinkSchema }))
    .mutation(async ({ ctx, input }) => {
      const existing = await prisma.shareLink.findFirst({
        where: { id: input.id, userId: ctx.user.id },
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Share link not found" });
      }

      const { passcode, visibility, expiresAt, ...rest } = input.data;

      let passcodeHash: string | null | undefined;
      if (passcode) {
        passcodeHash = await bcrypt.hash(passcode, 10);
      } else if (visibility && visibility !== "PASSCODE") {
        passcodeHash = null;
      }

      return prisma.shareLink.update({
        where: { id: input.id },
        data: {
          ...rest,
          ...(visibility !== undefined && { visibility }),
          ...(passcodeHash !== undefined && { passcodeHash }),
          ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
          ...(visibility !== undefined && { indexable: visibility === "PUBLIC" }),
        },
        select: SHARE_LINK_SELECT,
      });
    }),

  // ── delete ──────────────────────────────────────────────────────────────
  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const existing = await prisma.shareLink.findFirst({
        where: { id: input.id, userId: ctx.user.id },
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Share link not found" });
      }

      await prisma.shareLink.delete({ where: { id: input.id } });
      return { deleted: true, id: input.id };
    }),

  // ── preview ──────────────────────────────────────────────────────────────
  // Public — authenticated caller gets social state (upvoted / bookmarked / following)
  preview: publicProcedure
    .input(
      z.object({
        slug: z.string().min(1),
        passcode: z.string().optional(),
        ip: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { slug, passcode, ip = "anonymous" } = input;

      // Rate limit by IP (passed from the page/component layer)
      const { success } = await checkRateLimit(apiRateLimit, `preview:${ip}`);
      if (!success) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many requests. Please try again later." });
      }

      const cacheKey = `shareLink:${slug}`;
      let shareLink: Awaited<ReturnType<typeof fetchShareLink>> | null = null;

      // Only cache for unauthenticated, non-passcode reads
      if (!ctx.user && !passcode) {
        shareLink = await cacheGet<Awaited<ReturnType<typeof fetchShareLink>>>(cacheKey);
      }

      if (!shareLink) {
        shareLink = await fetchShareLink(slug);
        if (shareLink?.visibility === "PUBLIC" && !ctx.user) {
          await cacheSet(cacheKey, shareLink, 30);
        }
      }

      if (!shareLink || !shareLink.snippet) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Share link not found" });
      }

      // Passcode protection
      if (shareLink.visibility === "PASSCODE" && shareLink.passcodeHash) {
        const isOwner = ctx.user?.id === shareLink.userId;

        if (!isOwner) {
          if (!passcode) {
            throw new TRPCError({ code: "FORBIDDEN", message: "Passcode required" });
          }
          const isValid = await bcrypt.compare(passcode, shareLink.passcodeHash);
          if (!isValid) {
            throw new TRPCError({ code: "FORBIDDEN", message: "Invalid passcode" });
          }
        }
      }

      const snippet = shareLink.snippet;
      let userUpvoted = false;
      let userBookmarked = false;
      let isFollowing = false;
      let currentUserId: string | undefined;

      if (ctx.user) {
        currentUserId = ctx.user.id;

        const [upvote, bookmark, follow] = await Promise.all([
          prisma.snippetUpvote.findUnique({
            where: { snippetId_userId: { snippetId: snippet.id, userId: ctx.user.id } },
          }),
          prisma.snippetBookmark.findUnique({
            where: { snippetId_userId: { snippetId: snippet.id, userId: ctx.user.id } },
          }),
          snippet.user?.id
            ? prisma.userFollows.findUnique({
                where: {
                  followerId_followingId: { followerId: ctx.user.id, followingId: snippet.user.id },
                },
              })
            : Promise.resolve(null),
        ]);

        userUpvoted = !!upvote;
        userBookmarked = !!bookmark;
        isFollowing = !!follow;
      }

      return { shareLink, snippet, userUpvoted, userBookmarked, isFollowing, currentUserId };
    }),

  // ── analytics ────────────────────────────────────────────────────────────
  analytics: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const link = await prisma.shareLink.findFirst({
        where: { id: input.id, userId: ctx.user.id },
        select: {
          id: true,
          slug: true,
          viewCount: true,
          maxViews: true,
          expiresAt: true,
          views: {
            orderBy: { viewedAt: "desc" },
            take: 100,
            select: { id: true, passcodeUsed: true, referer: true, viewedAt: true },
          },
        },
      });

      if (!link) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Share link not found" });
      }

      const byDay = link.views.reduce<Record<string, number>>((acc, v) => {
        const day = v.viewedAt.toISOString().slice(0, 10);
        acc[day] = (acc[day] ?? 0) + 1;
        return acc;
      }, {});

      return {
        id: link.id,
        slug: link.slug,
        totalViews: link.viewCount,
        maxViews: link.maxViews,
        expiresAt: link.expiresAt,
        recentViews: link.views,
        viewsByDay: byDay,
      };
    }),
});

// ── Internal helper ───────────────────────────────────────────────────────────

async function fetchShareLink(slug: string) {
  return prisma.shareLink.findUnique({
    where: { slug },
    include: {
      snippet: {
        include: {
          user: { select: { id: true, name: true, email: true, clerkId: true } },
          presentation: true,
          _count: { select: { upvotes: true, bookmarks: true, comments: true } },
        },
      },
    },
  });
}
