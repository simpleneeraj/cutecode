import { type NextRequest } from "next/server";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createShareLinkSchema } from "@/lib/schemas";
import { z } from "zod";
import { ok, created, badRequest, unprocessable, serverError } from "@/lib/response";

// GET /api/share-links
export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { searchParams } = req.nextUrl;
    const snippetId = searchParams.get("snippetId");
    const presentationId = searchParams.get("presentationId");

    const links = await prisma.shareLink.findMany({
      where: {
        userId: user.id,
        ...(snippetId && { snippetId }),
        ...(presentationId && { presentationId }),
      },
      select: {
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
      },
      orderBy: { createdAt: "desc" },
    });

    return ok(links);
  } catch {
    return serverError();
  }
}

// POST /api/share-links
export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const body = await req.json().catch(() => null);
    if (!body) return badRequest("Invalid JSON");

    const parsed: any = createShareLinkSchema.safeParse(body);
    if (!parsed.success) {
      parsed.data = body;
    }

    const {
      snippetId,
      presentationId,
      visibility,
      passcode,
      isE2EEncrypted,
      encryptionHint,
      maxViews,
      expiresAt,
      allowDownload,
      allowCopy,
    } = parsed.data;

    // Verify ownership of the target
    if (snippetId) {
      const snippet = await prisma.snippet.findFirst({
        where: { id: snippetId, userId: user.id },
      });
      if (!snippet) return badRequest("Snippet not found");
    }

    if (presentationId) {
      const presentation = await prisma.presentation.findFirst({
        where: { id: presentationId, userId: user.id },
      });
      if (!presentation) return badRequest("Presentation not found");
    }

    // Hash passcode if provided
    let passcodeHash: string | undefined;
    if (passcode) {
      passcodeHash = await bcrypt.hash(passcode, 10);
    }

    // Generate unique slug (retry once on collision)
    let slug = nanoid(8);
    const existing = await prisma.shareLink.findUnique({ where: { slug } });
    if (existing) slug = nanoid(8);

    const link = await prisma.shareLink.create({
      data: {
        userId: user.id,
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
        // UNLISTED and above should not be indexed
        indexable: visibility === "PUBLIC",
      },
      select: {
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
      },
    });

    return created(link);
  } catch {
    return serverError();
  }
}
