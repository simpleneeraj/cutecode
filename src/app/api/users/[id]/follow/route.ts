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

    const { success } = await checkRateLimit(socialRateLimit, `follow:${user.id}`);
    if (!success) {
      return NextResponse.json({ message: "Too many requests. Slow down." }, { status: 429 });
    }

    const { id: followingId } = await params;

    if (user.id === followingId) {
      return badRequest("You cannot follow yourself");
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: followingId },
      select: { id: true },
    });
    if (!targetUser) return badRequest("User not found");

    const existing = await prisma.userFollows.findUnique({
      where: { followerId_followingId: { followerId: user.id, followingId } },
    });

    if (existing) {
      await prisma.userFollows.delete({
        where: { followerId_followingId: { followerId: user.id, followingId } },
      });
      const count = await prisma.userFollows.count({ where: { followingId } });
      // Bust profile caches so counts update on next read
      await Promise.all([cacheDel(`user-profile:${followingId}`), cacheDel(`user-profile:${user.id}`)]);
      return ok({ following: false, followerCount: count });
    }

    await prisma.userFollows.create({ data: { followerId: user.id, followingId } });
    const count = await prisma.userFollows.count({ where: { followingId } });
    await Promise.all([cacheDel(`user-profile:${followingId}`), cacheDel(`user-profile:${user.id}`)]);
    return ok({ following: true, followerCount: count });
  } catch {
    return serverError();
  }
}
