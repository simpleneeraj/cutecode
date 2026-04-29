import { prisma } from "@/lib/db";
import { type NextRequest, NextResponse } from "next/server";
import { ok, notFound, serverError } from "@/lib/response";
import { currentUser } from "@clerk/nextjs/server";
import { apiRateLimit, cacheGet, cacheSet, checkRateLimit } from "@/lib/redis";

type Params = { params: Promise<{ id: string }> };

// GET /api/users/[id] — public profile: counts + isFollowing for the viewer
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id: userId } = await params;
    const clerkUser = await currentUser();

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "anonymous";
    const { success } = await checkRateLimit(apiRateLimit, `user-profile:${ip}`);
    if (!success) {
      return NextResponse.json({ message: "Too many requests." }, { status: 429 });
    }

    const cacheKey = `user-profile:${userId}`;
    let profile = await cacheGet<any>(cacheKey);

    if (!profile) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          clerkId: true,
          plan: true,
          createdAt: true,
          _count: {
            select: {
              followers: true,
              following: true,
              snippets: true,
            },
          },
        },
      });

      if (!user) return notFound("User not found");
      profile = user;
      await cacheSet(cacheKey, profile, 60); // cache 60s
    }

    // isFollowing is viewer-specific — never cache it
    let isFollowing = false;
    let isOwnProfile = false;

    if (clerkUser) {
      const dbViewer = await prisma.user.findUnique({
        where: { clerkId: clerkUser.id },
        select: { id: true },
      });

      if (dbViewer) {
        isOwnProfile = dbViewer.id === userId;

        if (!isOwnProfile) {
          const follow = await prisma.userFollows.findUnique({
            where: {
              followerId_followingId: {
                followerId: dbViewer.id,
                followingId: userId,
              },
            },
          });
          isFollowing = !!follow;
        }
      }
    }

    return ok({ ...profile, isFollowing, isOwnProfile });
  } catch (err) {
    console.error("[GET /api/users/[id]]", err);
    return serverError();
  }
}
