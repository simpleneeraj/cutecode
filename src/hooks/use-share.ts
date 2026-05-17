/**
 *
 * SWR-backed hooks for all share-link procedures.
 * Components must NEVER call `trpc` directly — always use these hooks.
 *
 * Cache key convention:
 *   ['share.list', snippetId?, presentationId?]
 *   ['share.preview', slug, passcode?]
 *   ['share.analytics', id]
 */

"use client";

import useSWR, { useSWRConfig } from "swr";
import { trpc } from "@/lib/trpc";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/types";

type RouterOutput = inferRouterOutputs<AppRouter>;

export type ShareListOutput = RouterOutput["share"]["list"];
export type SharePreviewOutput = RouterOutput["share"]["preview"];
export type ShareAnalyticsOutput = RouterOutput["share"]["analytics"];
export type ShareCreateOutput = RouterOutput["share"]["create"];

// ─────────────────────────────────────────────
// useShareLinkList
// ─────────────────────────────────────────────

export function useShareList({
  snippetId,
  presentationId,
}: {
  snippetId?: string;
  presentationId?: string;
} = {}) {
  return useSWR(["share.list", snippetId ?? null, presentationId ?? null] as const, () =>
    trpc.share.list.query({ snippetId, presentationId }),
  );
}

// ─────────────────────────────────────────────
// useShareLinkPreview
// ─────────────────────────────────────────────

export function useSharePreview(slug: string | null, { passcode, ip }: { passcode?: string; ip?: string } = {}) {
  return useSWR(
    slug ? (["share.preview", slug, passcode ?? null] as const) : null,
    () => trpc.share.preview.query({ slug: slug!, passcode, ip }),
    {
      refreshInterval: 30_000,
      revalidateOnFocus: false,
      dedupingInterval: 5_000,
      // Don't retry on FORBIDDEN — it's intentional (passcode required / wrong passcode)
      shouldRetryOnError: (err: any) => err?.data?.code !== "FORBIDDEN",
    },
  );
}

// ─────────────────────────────────────────────
// useShareLinkAnalytics
// ─────────────────────────────────────────────

export function useShareAnalytics(id: string | null) {
  return useSWR(id ? (["share.analytics", id] as const) : null, () => trpc.share.analytics.query({ id: id! }));
}

// ─────────────────────────────────────────────
// useShareLinkMutations
// ─────────────────────────────────────────────

export type CreateShareInput = {
  snippetId?: string;
  presentationId?: string;
  visibility?: "PUBLIC" | "UNLISTED" | "PASSCODE" | "PRIVATE";
  passcode?: string;
  isE2EEncrypted?: boolean;
  encryptionHint?: string;
  maxViews?: number;
  expiresAt?: string;
  allowDownload?: boolean;
  allowCopy?: boolean;
};

export type UpdateShareInput = {
  visibility?: "PUBLIC" | "UNLISTED" | "PASSCODE" | "PRIVATE";
  passcode?: string;
  isE2EEncrypted?: boolean;
  encryptionHint?: string;
  maxViews?: number | null;
  expiresAt?: string | null;
  allowDownload?: boolean;
  allowCopy?: boolean;
};

export function useShareMutations() {
  const { mutate } = useSWRConfig();

  const createShare = async (input: CreateShareInput) => {
    const result = await trpc.share.create.mutate({
      ...input,
      visibility: input.visibility ?? "PUBLIC",
      isE2EEncrypted: input.isE2EEncrypted ?? false,
      allowDownload: input.allowDownload ?? true,
      allowCopy: input.allowCopy ?? true,
    });
    await mutate((key) => Array.isArray(key) && key[0] === "share.list");
    return result;
  };

  const updateShare = async (id: string, data: UpdateShareInput) => {
    const result = await trpc.share.update.mutate({ id, data });
    await mutate((key) => Array.isArray(key) && key[0] === "share.list");
    return result;
  };

  const deleteShare = async (id: string) => {
    const result = await trpc.share.delete.mutate({ id });
    await mutate((key) => Array.isArray(key) && key[0] === "share.list");
    return result;
  };

  return { createShare, updateShare, deleteShare };
}
