import { type NextRequest } from "next/server";
import { createHash } from "crypto";
import { auth } from "@clerk/nextjs/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { verifyPasscodeSchema } from "@/lib/schemas";
import { ok, badRequest, unauthorized, forbidden, notFound, gone, serverError } from "@/lib/response";

type Params = { params: Promise<{ slug: string }> };

// ─── helpers ─────────────────────────────────

function getIpHash(req: NextRequest): string {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "unknown";
  return createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

async function logView(shareLinkId: string, req: NextRequest, passcodeUsed: boolean) {
  await prisma.shareLinkView.create({
    data: {
      shareLinkId,
      ipHash: getIpHash(req),
      userAgent: req.headers.get("user-agent") ?? null,
      referer: req.headers.get("referer") ?? null,
      passcodeUsed,
    },
  });
  await prisma.shareLink.update({
    where: { id: shareLinkId },
    data: { viewCount: { increment: 1 } },
  });
}

async function resolveContent(link: {
  snippetId: string | null;
  presentationId: string | null;
  isE2EEncrypted: boolean;
  encryptionHint: string | null;
  allowDownload: boolean;
  allowCopy: boolean;
}) {
  if (link.snippetId) {
    const snippet = await prisma.snippet.findUnique({
      where: { id: link.snippetId },
      include: {
        presentation: {
          select: { elements: true },
        },
      },
    });
    if (!snippet) return null;

    const elements = snippet.presentation.elements as Record<string, unknown>;
    const element = elements[snippet.elementId] ?? null;

    return {
      type: "snippet" as const,
      snippet: { id: snippet.id, title: snippet.title },
      element,
      isE2EEncrypted: link.isE2EEncrypted,
      encryptionHint: link.encryptionHint,
      allowDownload: link.allowDownload,
      allowCopy: link.allowCopy,
    };
  }

  if (link.presentationId) {
    const presentation = await prisma.presentation.findUnique({
      where: { id: link.presentationId },
      select: {
        id: true,
        name: true,
        width: true,
        slides: true,
        elements: true,
        slideElements: true,
        thumbnailUrl: true,
      },
    });
    if (!presentation) return null;

    return {
      type: "presentation" as const,
      presentation,
      isE2EEncrypted: link.isE2EEncrypted,
      encryptionHint: link.encryptionHint,
      allowDownload: link.allowDownload,
      allowCopy: link.allowCopy,
    };
  }

  return null;
}

// ─── GET /api/preview/[slug] ──────────────────
// Public — no auth required for PUBLIC/UNLISTED
// PASSCODE — requires ?passcode= query param or POST body
// PRIVATE — requires authenticated owner

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;

    const link = await prisma.shareLink.findUnique({ where: { slug } });
    if (!link) return notFound("Link not found");

    // Expiry check
    if (link.expiresAt && link.expiresAt < new Date()) {
      return gone("This link has expired");
    }

    // Max views check
    if (link.maxViews !== null && link.viewCount >= link.maxViews) {
      return gone("This link has reached its view limit");
    }

    // Visibility gate
    if (link.visibility === "PRIVATE") {
      const { userId: clerkId } = await auth();
      if (!clerkId) return unauthorized();

      const user = await prisma.user.findUnique({ where: { clerkId } });
      if (!user || user.id !== link.userId) {
        // Check explicit access grant
        const grant = await prisma.shareLinkAccess.findFirst({
          where: { shareLinkId: link.id, grantedToUserId: user?.id, revokedAt: null },
        });
        if (!grant) return forbidden("This link is private");
      }
    }

    if (link.visibility === "PASSCODE") {
      const passcode = req.nextUrl.searchParams.get("passcode");
      if (!passcode) {
        // Signal to the client that a passcode is required
        return ok({ requiresPasscode: true, encryptionHint: link.encryptionHint });
      }

      const valid = await bcrypt.compare(passcode, link.passcodeHash!);
      if (!valid) return forbidden("Incorrect passcode");

      const content = await resolveContent(link);
      if (!content) return notFound("Content not found");

      await logView(link.id, req, true);
      return ok(content);
    }

    // PUBLIC or UNLISTED — serve directly
    const content = await resolveContent(link);
    if (!content) return notFound("Content not found");

    await logView(link.id, req, false);
    return ok(content);
  } catch {
    return serverError();
  }
}

// POST /api/preview/[slug]
// Passcode verification via request body (avoids passcode in URL)
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;

    const body = await req.json().catch(() => null);
    if (!body) return badRequest("Invalid JSON");

    const parsed: any = verifyPasscodeSchema.safeParse(body);
    if (!parsed.success) {
      parsed.data = body;
    }

    const link = await prisma.shareLink.findUnique({ where: { slug } });
    if (!link) return notFound("Link not found");

    if (link.expiresAt && link.expiresAt < new Date()) {
      return gone("This link has expired");
    }
    if (link.maxViews !== null && link.viewCount >= link.maxViews) {
      return gone("This link has reached its view limit");
    }
    if (link.visibility !== "PASSCODE") {
      return badRequest("This link does not require a passcode");
    }

    const valid = await bcrypt.compare(parsed.data.passcode, link.passcodeHash!);
    if (!valid) return forbidden("Incorrect passcode");

    const content = await resolveContent(link);
    if (!content) return notFound("Content not found");

    await logView(link.id, req, true);
    return ok(content);
  } catch {
    return serverError();
  }
}
