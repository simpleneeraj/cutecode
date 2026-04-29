import { type NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateShareLinkSchema } from "@/lib/schemas";
import { z } from "zod";
import { ok, noContent, badRequest, notFound, unprocessable, serverError } from "@/lib/response";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/share-links/[id]
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { id } = await params;

    const body = await req.json().catch(() => null);
    if (!body) return badRequest("Invalid JSON");

    const parsed: any = updateShareLinkSchema.safeParse(body);
    if (!parsed.success) {
      parsed.data = body;
    }

    const existing = await prisma.shareLink.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) return notFound("Share link not found");

    const { passcode, visibility, expiresAt, ...rest } = parsed.data;

    let passcodeHash: string | null | undefined;
    if (passcode) {
      passcodeHash = await bcrypt.hash(passcode, 10);
    } else if (visibility && visibility !== "PASSCODE") {
      // Clearing passcode when switching away from PASSCODE visibility
      passcodeHash = null;
    }

    const link = await prisma.shareLink.update({
      where: { id },
      data: {
        ...rest,
        ...(visibility !== undefined && { visibility }),
        ...(passcodeHash !== undefined && { passcodeHash }),
        ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
        // Re-derive indexable from visibility
        ...(visibility !== undefined && { indexable: visibility === "PUBLIC" }),
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
        updatedAt: true,
      },
    });

    return ok(link);
  } catch {
    return serverError();
  }
}

// DELETE /api/share-links/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { id } = await params;

    const existing = await prisma.shareLink.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) return notFound("Share link not found");

    await prisma.shareLink.delete({ where: { id } });

    return noContent();
  } catch {
    return serverError();
  }
}
