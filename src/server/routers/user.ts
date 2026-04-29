/**
 * server/routers/user.ts
 *
 * All user/social tRPC procedures.
 *
 * Procedures:
 *   user.profile       — public profile (counts + isFollowing) — Redis-cached
 *   user.followers     — cursor-paginated followers list
 *   user.following     — cursor-paginated following list
 *   user.toggleFollow  — follow / unfollow (auth required)
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { router, protectedProcedure, publicProcedure } from "../init";
import {
  apiRateLimit,
  socialRateLimit,
  checkRateLimit,
  cacheGet,
  cacheSet,
  cacheDel,
} from "@/lib/redis";

const PAGE_SIZE = 20;

export const userRouter = router({
  // ── profile ──────────────────────────────────────────────────────────────
  profile: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        ip: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId, ip = "anonymous" } = input;

      const { success } = await checkRateLimit(apiRateLimit, `user-profile:${ip}`);
      if (!success) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many requests." });
      }

      const cacheKey = `user-profile:${userId}`;
      let profile = await cacheGet<{
        id: string;
        name: string | null;
        email: string;
        clerkId: string;
        plan: string;
        createdAt: Date;
        _count: { followers: number; following: number; snippets: number };
      }>(cacheKey);

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
            _count: { select: { followers: true, following: true, snippets: true } },
          },
        });

        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        profile = user;
        await cacheSet(cacheKey, profile, 60);
      }

      // isFollowing / isOwnProfile are viewer-specific — never cache them
      let isFollowing = false;
      let isOwnProfile = false;

      if (ctx.user) {
        isOwnProfile = ctx.user.id === userId;
        if (!isOwnProfile) {
          const follow = await prisma.userFollows.findUnique({
            where: { followerId_followingId: { followerId: ctx.user.id, followingId: userId } },
          });
          isFollowing = !!follow;
        }
      }

      return { ...profile, isFollowing, isOwnProfile };
    }),

  // ── followers ────────────────────────────────────────────────────────────
  followers: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        cursor: z.string().optional(),
        ip: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId, cursor, ip = "anonymous" } = input;

      const { success } = await checkRateLimit(apiRateLimit, `followers-list:${ip}`);
      if (!success) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many requests." });
      }

      const target = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
      if (!target) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

      const rows = await prisma.userFollows.findMany({
        where: { followingId: userId },
        take: PAGE_SIZE,
        ...(cursor ? { skip: 1, cursor: { followerId_followingId: { followerId: cursor, followingId: userId } } } : {}),
        orderBy: { createdAt: "desc" },
        include: {
          follower: {
            select: { id: true, name: true, clerkId: true, plan: true, _count: { select: { followers: true } } },
          },
        },
      });

      // Batch: is the viewer following each of these users?
      let viewerFollowingSet = new Set<string>();
      if (ctx.user && rows.length > 0) {
        const followerIds = rows.map((r) => r.follower.id);
        const follows = await prisma.userFollows.findMany({
          where: { followerId: ctx.user.id, followingId: { in: followerIds } },
          select: { followingId: true },
        });
        viewerFollowingSet = new Set(follows.map((f) => f.followingId));
      }

      const users = rows.map((r) => ({
        ...r.follower,
        followedAt: r.createdAt,
        isFollowing: viewerFollowingSet.has(r.follower.id),
        isOwnProfile: r.follower.id === ctx.user?.id,
      }));

      const nextCursor = rows.length === PAGE_SIZE ? rows[rows.length - 1].follower.id : null;
      return { users, nextCursor, total: users.length };
    }),

  // ── following ────────────────────────────────────────────────────────────
  following: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        cursor: z.string().optional(),
        ip: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId, cursor, ip = "anonymous" } = input;

      const { success } = await checkRateLimit(apiRateLimit, `following-list:${ip}`);
      if (!success) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many requests." });
      }

      const target = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
      if (!target) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

      const rows = await prisma.userFollows.findMany({
        where: { followerId: userId },
        take: PAGE_SIZE,
        ...(cursor ? { skip: 1, cursor: { followerId_followingId: { followerId: userId, followingId: cursor } } } : {}),
        orderBy: { createdAt: "desc" },
        include: {
          following: {
            select: { id: true, name: true, clerkId: true, plan: true, _count: { select: { followers: true } } },
          },
        },
      });

      let viewerFollowingSet = new Set<string>();
      if (ctx.user && rows.length > 0) {
        const targetIds = rows.map((r) => r.following.id);
        const follows = await prisma.userFollows.findMany({
          where: { followerId: ctx.user.id, followingId: { in: targetIds } },
          select: { followingId: true },
        });
        viewerFollowingSet = new Set(follows.map((f) => f.followingId));
      }

      const users = rows.map((r) => ({
        ...r.following,
        followedAt: r.createdAt,
        isFollowing: viewerFollowingSet.has(r.following.id),
        isOwnProfile: r.following.id === ctx.user?.id,
      }));

      const nextCursor = rows.length === PAGE_SIZE ? rows[rows.length - 1].following.id : null;
      return { users, nextCursor, total: users.length };
    }),

  // ── toggleFollow ─────────────────────────────────────────────────────────
  toggleFollow: protectedProcedure
    .input(z.object({ targetUserId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { targetUserId } = input;

      if (ctx.user.id === targetUserId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "You cannot follow yourself" });
      }

      const { success } = await checkRateLimit(socialRateLimit, `follow:${ctx.user.id}`);
      if (!success) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many requests. Slow down." });
      }

      const targetUser = await prisma.user.findUnique({ where: { id: targetUserId }, select: { id: true } });
      if (!targetUser) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

      const existing = await prisma.userFollows.findUnique({
        where: { followerId_followingId: { followerId: ctx.user.id, followingId: targetUserId } },
      });

      if (existing) {
        await prisma.userFollows.delete({
          where: { followerId_followingId: { followerId: ctx.user.id, followingId: targetUserId } },
        });
        const count = await prisma.userFollows.count({ where: { followingId: targetUserId } });
        await Promise.all([
          cacheDel(`user-profile:${targetUserId}`),
          cacheDel(`user-profile:${ctx.user.id}`),
        ]);
        return { following: false, followerCount: count };
      }

      await prisma.userFollows.create({ data: { followerId: ctx.user.id, followingId: targetUserId } });
      const count = await prisma.userFollows.count({ where: { followingId: targetUserId } });
      await Promise.all([
        cacheDel(`user-profile:${targetUserId}`),
        cacheDel(`user-profile:${ctx.user.id}`),
      ]);
      return { following: true, followerCount: count };
    }),
});
