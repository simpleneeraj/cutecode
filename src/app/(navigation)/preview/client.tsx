"use client";

import { useCallback, useRef, useState } from "react";
import View from "@/components/view";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import PreviewLayout from "@/components/layouts/preview";
import { toast } from "@/components/toast";
import { wallpaperOptions } from "./share/config";

// ── tRPC hooks ────────────────────────────────────────────────────────────────
import { useShareLinkPreview } from "@/hooks/useShareLink";
import { useSnippetMutations } from "@/hooks/useSnippet";
import { useUserProfile } from "@/hooks/useUser";

// ── Sub-components ────────────────────────────────────────────────────────────
import { PasscodeGate } from "./components/passcode-gate";
import { SnippetFrame } from "./components/snippet-frame";
import { SnippetCard } from "./components/snippet-card";
import { Spinner } from "@/components/ui/spinner";
import BlackHoleLoader from "@/components/loader/black-hole";

// ─────────────────────────────────────────────────────────────────────────────

type PreviewSnippetClientProps = { slug: string };

export default function PreviewSnippetClient({ slug }: PreviewSnippetClientProps) {
  const [passcode, setPasscode] = useState("");
  const [submittedPasscode, setSubmittedPasscode] = useState("");

  const { data, isLoading, error, mutate } = useShareLinkPreview(slug, {
    passcode: submittedPasscode || undefined,
  });

  const snippetId = data?.snippet?.id ?? "";
  const authorId = data?.snippet?.user?.id ?? "";

  const { toggleUpvote, toggleBookmark } = useSnippetMutations();
  const { data: profile } = useUserProfile(authorId || null);

  // ── Optimistic toggle ───────────────────────────────────────────────────────

  const pendingAction = useRef(false);

  const withOptimisticToggle = useCallback(
    async (optimisticData: unknown, action: () => Promise<unknown>, errorMessage: string) => {
      if (pendingAction.current) return;
      pendingAction.current = true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mutate(optimisticData as any, false);
      try {
        await action();
        mutate();
      } catch {
        toast.error(errorMessage);
        mutate();
      } finally {
        pendingAction.current = false;
      }
    },
    [mutate],
  );

  const handleUpvote = async () => {
    if (!data?.currentUserId) {
      toast.error("Sign in to upvote.");
      return;
    }
    if (!snippetId) return;
    await withOptimisticToggle(
      {
        ...data,
        userUpvoted: !data.userUpvoted,
        snippet: {
          ...data.snippet,
          _count: {
            ...data.snippet._count,
            upvotes: (data.snippet._count?.upvotes ?? 0) + (!data.userUpvoted ? 1 : -1),
          },
        },
      },
      () => toggleUpvote(snippetId),
      "Failed to upvote.",
    );
  };

  const handleBookmark = async () => {
    if (!data?.currentUserId) {
      toast.error("Sign in to bookmark.");
      return;
    }
    if (!snippetId) return;
    await withOptimisticToggle(
      {
        ...data,
        userBookmarked: !data.userBookmarked,
        snippet: {
          ...data.snippet,
          _count: {
            ...data.snippet._count,
            bookmarks: (data.snippet._count?.bookmarks ?? 0) + (!data.userBookmarked ? 1 : -1),
          },
        },
      },
      () => toggleBookmark(snippetId),
      "Failed to bookmark.",
    );
  };

  // ── Guards ──────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <View className="layout-fill flex items-center justify-center">
        <BlackHoleLoader />
      </View>
    );
  }

  const trpcError = error as { data?: { code?: string } } | null;
  const requiresPasscode = trpcError?.data?.code === "FORBIDDEN";

  if (requiresPasscode) {
    return (
      <PasscodeGate
        passcode={passcode}
        invalidPasscode={!!submittedPasscode}
        onChange={setPasscode}
        onSubmit={() => setSubmittedPasscode(passcode)}
      />
    );
  }

  if (error || !data) {
    return (
      <View className="layout-fill flex items-center justify-center">
        <p className="text-muted-foreground">Snippet not found.</p>
      </View>
    );
  }

  // ── Data ────────────────────────────────────────────────────────────────────

  const { snippet, userUpvoted, userBookmarked, isFollowing, currentUserId } = data;

  // Prisma Json fields — intermediate `any` avoids TS2589 recursive type error
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawPresentation: any = snippet.presentation;
  const elements: Record<string, unknown> | undefined = rawPresentation?.elements;
  const slideElements: Record<string, string[]> | undefined = rawPresentation?.slideElements;

  const elementIds: string[] = slideElements
    ? (Object.values(slideElements).flat() as string[])
    : Object.keys(elements ?? {});

  const followerCount = profile?._count?.followers ?? 0;
  const followingCount = profile?._count?.following ?? 0;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <View className="layout-fill relative flex-1 bg-transparent">
      <PreviewLayout options={wallpaperOptions} />

      <View className="layout-scroll flex-2 gap-3">
        <View className="flex flex-row gap-3 z-10 max-w-4xl mx-auto w-full p-2 relative">
          <View className="flex flex-col flex-2 gap-3 relative">
            {/* Date badges */}
            <View className="flex items-center justify-center">
              <Badge variant="secondary" className="bg-background/75 backdrop-blur-lg">
                Snippet Created
              </Badge>
            </View>
            <View className="flex items-center justify-center">
              <Badge variant="secondary" className="bg-background/75 backdrop-blur-lg">
                {format(new Date(snippet.createdAt), "MMMM d, yyyy")}
              </Badge>
            </View>

            {/* Main card */}
            <SnippetCard
              author={snippet.user ?? undefined}
              description={snippet.description}
              commentCount={snippet._count?.comments ?? 0}
              upvoted={userUpvoted}
              upvoteCount={snippet._count?.upvotes ?? 0}
              bookmarked={userBookmarked}
              bookmarkCount={snippet._count?.bookmarks ?? 0}
              isFollowing={isFollowing}
              followerCount={followerCount}
              followingCount={followingCount}
              currentUserId={currentUserId}
              onUpvote={handleUpvote}
              onBookmark={handleBookmark}
            >
              {/* Rendered code frames */}
              <View className="flex flex-col gap-6">
                {elementIds.map((elId) => {
                  const element = elements?.[elId] as Record<string, unknown> | undefined;
                  if (!element) return null;
                  return (
                    <SnippetFrame
                      key={elId}
                      elementId={elId}
                      element={element}
                      windowWidth={rawPresentation?.width ?? 800}
                    />
                  );
                })}
              </View>
            </SnippetCard>
          </View>
        </View>
      </View>
    </View>
  );
}
