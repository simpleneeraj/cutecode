import { prisma } from "@/lib/db";
import { NextResponse, type NextRequest } from "next/server";
import { ok, notFound, serverError } from "@/lib/response";
import { getCurrentUser } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { cacheGet, cacheSet, apiRateLimit, checkRateLimit } from "@/lib/redis";

type Params = { params: Promise<{ id: string }> };

const CACHE_TTL = 30; // 30 seconds — short enough for counts to feel live

export async function GET(req: NextRequest, { params }: Params) {
  try {
    console.log("[preview/route] Forced recompile 3...");
    const { id: slug } = await params;
    const { searchParams } = new URL(req.url);
    const passcode = searchParams.get("passcode");
    const dbUser = await getCurrentUser();

    // Rate limit reads by IP
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "anonymous";
    const { success } = await checkRateLimit(apiRateLimit, `preview:${ip}`);
    if (!success) {
      return NextResponse.json({ message: "Too many requests. Please try again later." }, { status: 429 });
    }

    // Cache key excludes passcode (protected content is never cached)
    const cacheKey = `shareLink:${slug}`;
    let shareLink: any = null;

    // Only serve from cache for unauthenticated/public reads
    if (!dbUser && !passcode) {
      shareLink = await cacheGet<any>(cacheKey);
    }

    if (!shareLink) {
      shareLink = await prisma.shareLink.findUnique({
        where: { slug },
        include: {
          snippet: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  clerkId: true,
                },
              },
              presentation: true,
              _count: {
                select: {
                  upvotes: true,
                  bookmarks: true,
                  comments: true,
                },
              },
            },
          },
        },
      });

      // Only cache public snippets for unauthenticated users
      if (shareLink?.visibility === "PUBLIC" && !dbUser) {
        await cacheSet(cacheKey, shareLink, CACHE_TTL);
      }
    }

    if (!shareLink || !shareLink.snippet) {
      return notFound("ShareLink not found");
    }

    // Passcode protection
    if (shareLink.visibility === "PASSCODE" && shareLink.passcodeHash) {
      let isOwner = false;
      if (dbUser) {
        if (dbUser.id === shareLink.userId) isOwner = true;
      }

      if (!isOwner) {
        if (!passcode) {
          return NextResponse.json({ message: "Passcode required", requiresPasscode: true }, { status: 403 });
        }
        const isValid = await bcrypt.compare(passcode, shareLink.passcodeHash);
        if (!isValid) {
          return NextResponse.json(
            { message: "Invalid passcode", requiresPasscode: true, invalidPasscode: true },
            { status: 403 },
          );
        }
      }
    }

    const snippet = shareLink.snippet;
    let userUpvoted = false;
    let userBookmarked = false;
    let isFollowing = false;
    let currentUserId: string | undefined;

    if (dbUser) {
      currentUserId = dbUser.id;

      // Parallelise all three social-state lookups
      const [upvote, bookmark, follow] = await Promise.all([
        prisma.snippetUpvote.findUnique({
          where: { snippetId_userId: { snippetId: snippet.id, userId: dbUser.id } },
        }),
        prisma.snippetBookmark.findUnique({
          where: { snippetId_userId: { snippetId: snippet.id, userId: dbUser.id } },
        }),
        snippet.user?.id
          ? prisma.userFollows.findUnique({
              where: {
                followerId_followingId: { followerId: dbUser.id, followingId: snippet.user.id },
              },
            })
          : Promise.resolve(null),
      ]);

      userUpvoted = !!upvote;
      userBookmarked = !!bookmark;
      isFollowing = !!follow;
    }

    return ok({
      shareLink,
      snippet,
      userUpvoted,
      userBookmarked,
      isFollowing,
      currentUserId,
    });
  } catch (err) {
    console.error("[preview/route]", err);
    return serverError();
  }
}
