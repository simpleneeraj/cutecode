/**
 * hooks/usePresentation.ts
 *
 * SWR-backed hooks for all presentation procedures.
 * Components must NEVER call `trpc` directly — always use these hooks.
 *
 * Cache key convention:
 *   ['presentation.list', page, limit]
 *   ['presentation.get', id]
 */

"use client";

import useSWR, { useSWRConfig } from "swr";
import { trpc } from "@/lib/trpc";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/types";

type RouterOutput = inferRouterOutputs<AppRouter>;

export type PresentationListOutput = RouterOutput["presentation"]["list"];
export type PresentationGetOutput = RouterOutput["presentation"]["get"];

// ─────────────────────────────────────────────
// usePresentationList
// ─────────────────────────────────────────────

export function usePresentationList({ page = 1, limit = 20 }: { page?: number; limit?: number } = {}) {
  return useSWR(
    ["presentation.list", page, limit] as const,
    () => trpc.presentation.list.query({ page, limit }),
    { keepPreviousData: true }
  );
}

// ─────────────────────────────────────────────
// usePresentation (single)
// ─────────────────────────────────────────────

export function usePresentation(id: string | null) {
  return useSWR(
    id ? (["presentation.get", id] as const) : null,
    () => trpc.presentation.get.query({ id: id! })
  );
}

// ─────────────────────────────────────────────
// usePresentationMutations
// ─────────────────────────────────────────────

export function usePresentationMutations() {
  const { mutate } = useSWRConfig();

  const createPresentation = async (input: {
    name?: string;
    width?: number;
    slides?: Record<string, unknown>;
    elements?: Record<string, unknown>;
    slideElements?: Record<string, string[]>;
  }) => {
    const result = await trpc.presentation.create.mutate({
      name: input.name ?? "Untitled",
      width: input.width ?? 680,
      slides: input.slides ?? {},
      elements: input.elements ?? {},
      slideElements: input.slideElements ?? {},
    });
    await mutate((key) => Array.isArray(key) && key[0] === "presentation.list");
    return result;
  };

  const syncPresentation = async (
    id: string,
    data: {
      name?: string;
      width?: number;
      slides?: Record<string, unknown>;
      elements?: Record<string, unknown>;
      slideElements?: Record<string, string[]>;
    }
  ) => {
    const result = await trpc.presentation.sync.mutate({
      id,
      data: {
        name: data.name,
        width: data.width,
        slides: data.slides ?? {},
        elements: data.elements ?? {},
        slideElements: data.slideElements ?? {},
      },
    });
    await mutate(["presentation.get", id]);
    await mutate((key) => Array.isArray(key) && key[0] === "presentation.list");
    return result;
  };

  const deletePresentation = async (id: string) => {
    const result = await trpc.presentation.delete.mutate({ id });
    await mutate((key) => Array.isArray(key) && key[0] === "presentation.list");
    return result;
  };

  return { createPresentation, syncPresentation, deletePresentation };
}
