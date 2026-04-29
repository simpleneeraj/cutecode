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

    // Rate-limit by user ID, not IP — prevents VPN bypass and is fair per-user
    const { success } = await checkRateLimit(socialRateLimit, `upvote:${user.id}`);
    if (!success) {
      return NextResponse.json({ message: "Too many requests. Slow down." }, { status: 429 });
    }

    const { id: snippetId } = await params;

    const snippet = await prisma.snippet.findUnique({ where: { id: snippetId } });
    if (!snippet) return badRequest("Snippet not found");

    const existing = await prisma.snippetUpvote.findUnique({
      where: { snippetId_userId: { snippetId, userId: user.id } },
    });

    if (existing) {
      await prisma.snippetUpvote.delete({ where: { id: existing.id } });
      // Invalidate preview cache so counts stay fresh
      await cacheDel(`shareLink:${snippetId}`);
      const count = await prisma.snippetUpvote.count({ where: { snippetId } });
      return ok({ upvoted: false, count });
    }

    await prisma.snippetUpvote.create({ data: { snippetId, userId: user.id } });
    await cacheDel(`shareLink:${snippetId}`);
    const count = await prisma.snippetUpvote.count({ where: { snippetId } });
    return ok({ upvoted: true, count });
  } catch {
    return serverError();
  }
}
