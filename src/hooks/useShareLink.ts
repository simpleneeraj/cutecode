/**
 * hooks/useShareLink.ts
 *
 * SWR-backed hooks for all share-link procedures.
 * Components must NEVER call `trpc` directly — always use these hooks.
 *
 * Cache key convention:
 *   ['shareLink.list', snippetId?, presentationId?]
 *   ['shareLink.preview', slug, passcode?]
 *   ['shareLink.analytics', id]
 */

"use client";

import useSWR, { useSWRConfig } from "swr";
import { trpc } from "@/lib/trpc";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/types";

type RouterOutput = inferRouterOutputs<AppRouter>;

export type ShareLinkListOutput = RouterOutput["shareLink"]["list"];
export type ShareLinkPreviewOutput = RouterOutput["shareLink"]["preview"];
export type ShareLinkAnalyticsOutput = RouterOutput["shareLink"]["analytics"];
export type ShareLinkCreateOutput = RouterOutput["shareLink"]["create"];

// ─────────────────────────────────────────────
// useShareLinkList
// ─────────────────────────────────────────────

export function useShareLinkList({
  snippetId,
  presentationId,
}: {
  snippetId?: string;
  presentationId?: string;
} = {}) {
  return useSWR(
    ["shareLink.list", snippetId ?? null, presentationId ?? null] as const,
    () => trpc.shareLink.list.query({ snippetId, presentationId })
  );
}

// ─────────────────────────────────────────────
// useShareLinkPreview
// ─────────────────────────────────────────────

export function useShareLinkPreview(
  slug: string | null,
  { passcode, ip }: { passcode?: string; ip?: string } = {}
) {
  return useSWR(
    slug ? (["shareLink.preview", slug, passcode ?? null] as const) : null,
    () => trpc.shareLink.preview.query({ slug: slug!, passcode, ip }),
    {
      refreshInterval: 30_000,
      revalidateOnFocus: false,
      dedupingInterval: 5_000,
    }
  );
}

// ─────────────────────────────────────────────
// useShareLinkAnalytics
// ─────────────────────────────────────────────

export function useShareLinkAnalytics(id: string | null) {
  return useSWR(
    id ? (["shareLink.analytics", id] as const) : null,
    () => trpc.shareLink.analytics.query({ id: id! })
  );
}

// ─────────────────────────────────────────────
// useShareLinkMutations
// ─────────────────────────────────────────────

export type CreateShareLinkInput = {
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

export type UpdateShareLinkInput = {
  visibility?: "PUBLIC" | "UNLISTED" | "PASSCODE" | "PRIVATE";
  passcode?: string;
  isE2EEncrypted?: boolean;
  encryptionHint?: string;
  maxViews?: number | null;
  expiresAt?: string | null;
  allowDownload?: boolean;
  allowCopy?: boolean;
};

export function useShareLinkMutations() {
  const { mutate } = useSWRConfig();

  const createShareLink = async (input: CreateShareLinkInput) => {
    const result = await trpc.shareLink.create.mutate({
      ...input,
      visibility: input.visibility ?? "PUBLIC",
      isE2EEncrypted: input.isE2EEncrypted ?? false,
      allowDownload: input.allowDownload ?? true,
      allowCopy: input.allowCopy ?? true,
    });
    await mutate((key) => Array.isArray(key) && key[0] === "shareLink.list");
    return result;
  };

  const updateShareLink = async (id: string, data: UpdateShareLinkInput) => {
    const result = await trpc.shareLink.update.mutate({ id, data });
    await mutate((key) => Array.isArray(key) && key[0] === "shareLink.list");
    return result;
  };

  const deleteShareLink = async (id: string) => {
    const result = await trpc.shareLink.delete.mutate({ id });
    await mutate((key) => Array.isArray(key) && key[0] === "shareLink.list");
    return result;
  };

  return { createShareLink, updateShareLink, deleteShareLink };
}
