/**
 * server/routers/publish.ts
 *
 * Publish procedure — the big atomic "publish a snippet" operation.
 *
 * Procedures:
 *   publish.publish — creates or updates presentation + snippet + shareLink in one transaction
 */

import { z } from "zod";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/db";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../init";
import { publishRateLimit, publishDailyRateLimit, checkRateLimit } from "@/lib/redis";
import { ShareVisibility, type Prisma } from "@/generated/prisma/client";
import { Plan } from "@/generated/prisma/enums";
import { isPlanAtLeast } from "@/lib/billing/plans";
import { FREE_DAILY_PUBLISH_LIMIT } from "@/lib/billing/constants";

export const publishRouter = router({
  /**
   * Publish a presentation
   * @param name - Presentation name
   * @param width - Presentation width
   * @param slides - Presentation slides
   * @param elements - Presentation elements
   * @param slideElements - Presentation slide elements
   * @param elementId - Element id
   * @param title - Presentation title
   * @param description - Presentation description
   * @param tags - Presentation tags
   * @param visibility - Presentation visibility
   * @param passcode - Presentation passcode
   * @returns Published presentation
   * @throws TRPCError
   */
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
        tags: z.array(z.string()).max(10).optional(),
        visibility: z.enum(ShareVisibility).default(ShareVisibility.PUBLIC),
        passcode: z.string().min(4).max(32).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { success } = await checkRateLimit(publishRateLimit, `publish:${ctx.user.id}`);
      if (!success) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many publish requests. Please wait a minute." });
      }

      const {
        name,
        width,
        slides,
        elements,
        slideElements,
        elementId,
        title,
        description,
        tags,
        visibility,
        passcode,
      } = input;

      if (!elements[elementId]) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Missing required presentation elements." });
      }

      if (visibility === ShareVisibility.PASSCODE && (!passcode || passcode.length < 4)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Passcode must be at least 4 characters." });
      }

      const passcodeHash = visibility === ShareVisibility.PASSCODE && passcode ? await bcrypt.hash(passcode, 10) : null;

      const safeName = (name || "Untitled").slice(0, 120);
      const safeWidth = Math.max(400, Math.min(width ?? 680, 1600));

      /**
       * Idempotency: reuse existing share link for this elementId.
       * Updates do NOT count against the daily publish quota.
       */
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
              tags: tags ? { set: tags } : { set: [] },
              isPublic: visibility === ShareVisibility.PUBLIC,
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

      /**
       * New publish — enforce daily quota for free-plan users.
       * Pro and above get unlimited new publishes.
       */
      const isFreeUser = !isPlanAtLeast(ctx.user.plan, Plan.PRO);
      if (isFreeUser) {
        const { success: dailyOk } = await checkRateLimit(publishDailyRateLimit, `publish:daily:${ctx.user.id}`);
        if (!dailyOk) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: `Daily publish limit reached (${FREE_DAILY_PUBLISH_LIMIT}/day). Upgrade to Pro for unlimited publishes.`,
          });
        }
      }

      /**
       * First publish
       */
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
            tags: tags ? { set: tags } : { set: [] },
            isPublic: visibility === ShareVisibility.PUBLIC,
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
