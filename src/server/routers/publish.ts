/**
 * server/routers/publish.ts
 *
 * Publish procedure — the big atomic "publish a snippet" operation.
 *
 * Procedures:
 *   publish.publish — creates or updates presentation + snippet + shareLink in one transaction
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { type Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { router, protectedProcedure } from "../init";
import { publishRateLimit, checkRateLimit } from "@/lib/redis";

export const publishRouter = router({
  publish: protectedProcedure
    .input(
      z.object({
        name: z.string().max(120).optional(),
        width: z.number().int().optional(),
        slides: z.record(z.string(), z.unknown()).default({}),
        elements: z.record(z.string(), z.unknown()),
        slideElements: z.record(z.string(), z.array(z.string())).default({}),
        elementId: z.string().min(1),
        title: z.string().max(200).optional(),
        description: z.string().max(2000).optional(),
        visibility: z.enum(["PUBLIC", "UNLISTED", "PASSCODE", "PRIVATE"]).default("PUBLIC"),
        passcode: z.string().min(4).max(32).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { success } = await checkRateLimit(publishRateLimit, `publish:${ctx.user.id}`);
      if (!success) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many publish requests. Please wait a minute." });
      }

      const { name, width, slides, elements, slideElements, elementId, title, description, visibility, passcode } = input;

      if (!elements[elementId]) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Missing required presentation elements." });
      }

      if (visibility === "PASSCODE" && (!passcode || passcode.length < 4)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Passcode must be at least 4 characters." });
      }

      const passcodeHash = visibility === "PASSCODE" && passcode ? await bcrypt.hash(passcode, 10) : null;

      const safeName = (name || "Untitled").slice(0, 120);
      const safeWidth = Math.max(400, Math.min(width ?? 680, 1600));

      // ── Idempotency: reuse existing share link for this elementId ──────────
      const existingSnippet = await prisma.snippet.findFirst({
        where: { userId: ctx.user.id, elementId },
        include: { shareLinks: { select: { slug: true, id: true }, take: 1, orderBy: { createdAt: "asc" } } },
        orderBy: { createdAt: "desc" },
      });

      const existingSlug = existingSnippet?.shareLinks?.[0]?.slug;

      if (existingSnippet && existingSlug) {
        await prisma.$transaction(async (tx) => {
          await tx.presentation.update({
            where: { id: existingSnippet.presentationId },
            data: {
            name: safeName,
            width: safeWidth,
            slides: slides as Prisma.InputJsonValue,
            elements: elements as Prisma.InputJsonValue,
            slideElements: slideElements as Prisma.InputJsonValue,
          },
          });

          await tx.snippet.update({
            where: { id: existingSnippet.id },
            data: {
              title: title ?? undefined,
              description: description ?? undefined,
              isPublic: visibility === "PUBLIC",
            },
          });

          const existingShareLink = await tx.shareLink.findUnique({ where: { slug: existingSlug } });
          if (existingShareLink) {
            await tx.shareLink.update({
              where: { id: existingShareLink.id },
              data: {
                visibility,
                passcodeHash: passcodeHash ?? existingShareLink.passcodeHash,
              },
            });
          }
        });

        return { slug: existingSlug, updated: true };
      }

      // ── First publish ─────────────────────────────────────────────────────
      const slug = nanoid(8);

      const shareLink = await prisma.$transaction(async (tx) => {
        const presentation = await tx.presentation.create({
          data: {
            userId: ctx.user.id,
            name: safeName,
            width: safeWidth,
            slides: slides as Prisma.InputJsonValue,
            elements: elements as Prisma.InputJsonValue,
            slideElements: slideElements as Prisma.InputJsonValue,
          },
        });

        const snippet = await tx.snippet.create({
          data: {
            userId: ctx.user.id,
            presentationId: presentation.id,
            elementId,
            title: title ?? undefined,
            description: description ?? undefined,
            isPublic: visibility === "PUBLIC",
          },
        });

        return tx.shareLink.create({
          data: {
            userId: ctx.user.id,
            slug,
            targetType: "SNIPPET",
            targetId: snippet.id,
            snippetId: snippet.id,
            visibility,
            passcodeHash,
            allowCopy: true,
            allowDownload: true,
          },
        });
      });

      return { slug: shareLink.slug, updated: false };
    }),
});
