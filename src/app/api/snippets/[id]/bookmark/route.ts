import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { type NextRequest, NextResponse } from "next/server";
import { ok, badRequest, serverError } from "@/lib/response";
import { socialRateLimit, checkRateLimit, cacheDel } from "@/lib/redis";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { success } = await checkRateLimit(socialRateLimit, `bookmark:${user.id}`);
    if (!success) {
      return NextResponse.json({ message: "Too many requests. Slow down." }, { status: 429 });
    }

    const { id: snippetId } = await params;

    const snippet = await prisma.snippet.findUnique({ where: { id: snippetId } });
    if (!snippet) return badRequest("Snippet not found");

    const existing = await prisma.snippetBookmark.findUnique({
      where: { snippetId_userId: { snippetId, userId: user.id } },
    });

    if (existing) {
      await prisma.snippetBookmark.delete({ where: { id: existing.id } });
      await cacheDel(`shareLink:${snippetId}`);
      const count = await prisma.snippetBookmark.count({ where: { snippetId } });
      return ok({ bookmarked: false, count });
    }

    await prisma.snippetBookmark.create({ data: { snippetId, userId: user.id } });
    await cacheDel(`shareLink:${snippetId}`);
    const count = await prisma.snippetBookmark.count({ where: { snippetId } });
    return ok({ bookmarked: true, count });
  } catch {
    return serverError();
  }
}
