import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { type NextRequest, NextResponse } from "next/server";
import { ok, badRequest, serverError } from "@/lib/response";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { publishRateLimit, checkRateLimit } from "@/lib/redis";

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { success } = await checkRateLimit(publishRateLimit, `publish:${user.id}`);
    if (!success) {
      return NextResponse.json({ message: "Too many publish requests. Please wait a minute." }, { status: 429 });
    }

    const body = await req.json().catch(() => null);
    if (!body) return badRequest("Invalid JSON");

    const {
      name,
      width,
      slides,
      elements,
      slideElements,
      elementId,
      title,
      description,
      visibility,
      passcode,
    } = body;

    if (!elements || !elementId || !elements[elementId]) {
      return badRequest("Missing required presentation elements.");
    }

    if (visibility === "PASSCODE" && (!passcode || typeof passcode !== "string" || passcode.length < 4)) {
      return badRequest("Passcode must be at least 4 characters.");
    }

    const passcodeHash =
      visibility === "PASSCODE" && passcode ? await bcrypt.hash(passcode, 10) : null;

    // ── Idempotency: reuse the existing share link for this element ──────────
    // If the user already published this exact elementId, return the same slug.
    const existingSnippet = await prisma.snippet.findFirst({
      where: { userId: user.id, elementId },
      include: { shareLinks: { select: { slug: true }, take: 1, orderBy: { createdAt: "asc" } } },
      orderBy: { createdAt: "desc" },
    });

    const existingSlug = existingSnippet?.shareLinks?.[0]?.slug;

    if (existingSnippet && existingSlug) {
      // Update the existing presentation + share-link with fresh data
      await prisma.$transaction(async (tx) => {
        await tx.presentation.update({
          where: { id: existingSnippet.presentationId },
          data: {
            name: (name || "Untitled").slice(0, 120),
            width: Math.max(400, Math.min(width || 680, 1600)),
            slides: slides || {},
            elements: elements || {},
            slideElements: slideElements || {},
          },
        });

        await tx.snippet.update({
          where: { id: existingSnippet.id },
          data: {
            title: title ? String(title).slice(0, 200) : undefined,
            description: description ? String(description).slice(0, 2000) : undefined,
            isPublic: visibility === "PUBLIC",
          },
        });

        const existingShareLink = await tx.shareLink.findUnique({
          where: { slug: existingSlug },
        });
        if (existingShareLink) {
          await tx.shareLink.update({
            where: { id: existingShareLink.id },
            data: {
              visibility: visibility || "PUBLIC",
              passcodeHash: passcodeHash ?? existingShareLink.passcodeHash,
            },
          });
        }
      });

      return ok({ slug: existingSlug, updated: true });
    }

    // ── First publish: create presentation → snippet → shareLink ─────────────
    const slug = nanoid(8);

    const shareLink = await prisma.$transaction(async (tx) => {
      const presentation = await tx.presentation.create({
        data: {
          userId: user.id,
          name: (name || "Untitled").slice(0, 120),
          width: Math.max(400, Math.min(width || 680, 1600)),
          slides: slides || {},
          elements: elements || {},
          slideElements: slideElements || {},
        },
      });

      const snippet = await tx.snippet.create({
        data: {
          userId: user.id,
          presentationId: presentation.id,
          elementId,
          title: title ? String(title).slice(0, 200) : undefined,
          description: description ? String(description).slice(0, 2000) : undefined,
          isPublic: visibility === "PUBLIC",
        },
      });

      return tx.shareLink.create({
        data: {
          userId: user.id,
          slug,
          targetType: "SNIPPET",
          targetId: snippet.id,
          snippetId: snippet.id,
          visibility: visibility || "PUBLIC",
          passcodeHash,
          allowCopy: true,
          allowDownload: true,
        },
      });
    });

    return ok({ slug: shareLink.slug, updated: false });
  } catch (err) {
    console.error("[publish/route]", err);
    return serverError();
  }
}
