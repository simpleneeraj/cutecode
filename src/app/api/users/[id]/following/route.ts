import { prisma } from "@/lib/db";
import { type NextRequest, NextResponse } from "next/server";
import { ok, notFound, serverError } from "@/lib/response";
import { currentUser } from "@clerk/nextjs/server";
import { apiRateLimit, checkRateLimit } from "@/lib/redis";

type Params = { params: Promise<{ id: string }> };

const PAGE_SIZE = 20;

// GET /api/users/[id]/following?cursor=<id>
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id: userId } = await params;
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const clerkUser = await currentUser();

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "anonymous";
    const { success } = await checkRateLimit(apiRateLimit, `following-list:${ip}`);
    if (!success) {
      return NextResponse.json({ message: "Too many requests." }, { status: 429 });
    }

    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!target) return notFound("User not found");

    let viewerDbId: string | null = null;
    if (clerkUser) {
      const v = await prisma.user.findUnique({
        where: { clerkId: clerkUser.id },
        select: { id: true },
      });
      viewerDbId = v?.id ?? null;
    }

    const rows = await prisma.userFollows.findMany({
      where: { followerId: userId },
      take: PAGE_SIZE,
      ...(cursor
        ? { skip: 1, cursor: { followerId_followingId: { followerId: userId, followingId: cursor } } }
        : {}),
      orderBy: { createdAt: "desc" },
      include: {
        following: {
          select: { id: true, name: true, clerkId: true, plan: true, _count: { select: { followers: true } } },
        },
      },
    });

    // Batch: is the viewer following each of these users?
    let viewerFollowingSet = new Set<string>();
    if (viewerDbId && rows.length > 0) {
      const targetIds = rows.map((r) => r.following.id);
      const follows = await prisma.userFollows.findMany({
        where: { followerId: viewerDbId, followingId: { in: targetIds } },
        select: { followingId: true },
      });
      viewerFollowingSet = new Set(follows.map((f) => f.followingId));
    }

    const users = rows.map((r) => ({
      ...r.following,
      followedAt: r.createdAt,
      isFollowing: viewerFollowingSet.has(r.following.id),
      isOwnProfile: r.following.id === viewerDbId,
    }));

    const nextCursor = rows.length === PAGE_SIZE ? rows[rows.length - 1].following.id : null;

    return ok({ users, nextCursor, total: users.length });
  } catch (err) {
    console.error("[GET /api/users/[id]/following]", err);
    return serverError();
  }
}
