/**
 *
 * SWR-backed hooks for all user/social procedures.
 * Components must NEVER call `trpc` directly — always use these hooks.
 *
 * Cache key convention:
 *   ['user.profile', userId, ip?]
 *   ['user.followers', userId, cursor?]
 *   ['user.following', userId, cursor?]
 */

"use client";

import useSWR, { useSWRConfig } from "swr";
import { trpc } from "@/lib/trpc";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/types";

type RouterOutput = inferRouterOutputs<AppRouter>;

export type UserProfileOutput = RouterOutput["user"]["profile"];
export type UserFollowersOutput = RouterOutput["user"]["followers"];
export type UserFollowingOutput = RouterOutput["user"]["following"];
export type UserToggleFollowOutput = RouterOutput["user"]["toggleFollow"];

// ─────────────────────────────────────────────
// useUserProfile
// ─────────────────────────────────────────────

export function useUserProfile(userId: string | null | undefined, ip?: string) {
  return useSWR(
    userId ? (["user.profile", userId, ip ?? null] as const) : null,
    () => trpc.user.profile.query({ userId: userId!, ip }),
    { revalidateOnFocus: false, dedupingInterval: 10_000 },
  );
}

// ─────────────────────────────────────────────
// useUserFollowers
// ─────────────────────────────────────────────

export function useUserFollowers(userId: string | null | undefined, cursor?: string, ip?: string) {
  return useSWR(
    userId ? (["user.followers", userId, cursor ?? null] as const) : null,
    () => trpc.user.followers.query({ userId: userId!, cursor, ip }),
    { revalidateOnFocus: false },
  );
}

// ─────────────────────────────────────────────
// useUserFollowing
// ─────────────────────────────────────────────

export function useUserFollowing(userId: string | null | undefined, cursor?: string, ip?: string) {
  return useSWR(
    userId ? (["user.following", userId, cursor ?? null] as const) : null,
    () => trpc.user.following.query({ userId: userId!, cursor, ip }),
    { revalidateOnFocus: false },
  );
}

// ─────────────────────────────────────────────
// useUserMutations
// ─────────────────────────────────────────────

export function useUserMutations() {
  const { mutate } = useSWRConfig();

  const toggleFollow = async (targetUserId: string) => {
    const result = await trpc.user.toggleFollow.mutate({ targetUserId });
    // Revalidate profile cache for both parties
    await mutate((key) => Array.isArray(key) && key[0] === "user.profile" && key[1] === targetUserId);
    return result;
  };

  return { toggleFollow };
}
