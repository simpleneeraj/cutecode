// hooks/use-snippet-preview.ts
import { useCallback, useRef, useState } from "react";
import { toast } from "@/components/toast";
import { useSharePreview } from "@/hooks/use-share";
import { useSnippetMutations } from "@/hooks/use-snippet";
import { useUserProfile } from "@/hooks/use-user";

type ShareLinkPayload = NonNullable<ReturnType<typeof useSharePreview>["data"]>;

function buildUpvoteOptimisticPayload(payload: ShareLinkPayload): Record<string, unknown> {
  return {
    ...payload,
    userUpvoted: !payload.userUpvoted,
    snippet: {
      ...payload.snippet,
      _count: {
        ...payload.snippet._count,
        upvotes: (payload.snippet._count?.upvotes ?? 0) + (!payload.userUpvoted ? 1 : -1),
      },
    },
  };
}

function buildBookmarkOptimisticPayload(payload: ShareLinkPayload): Record<string, unknown> {
  return {
    ...payload,
    userBookmarked: !payload.userBookmarked,
    snippet: {
      ...payload.snippet,
      _count: {
        ...payload.snippet._count,
        bookmarks: (payload.snippet._count?.bookmarks ?? 0) + (!payload.userBookmarked ? 1 : -1),
      },
    },
  };
}

export function useSnippetPreview(slug: string) {
  const [passcodeInput, setPasscodeInput] = useState("");
  const [submittedPasscode, setSubmittedPasscode] = useState("");

  const {
    data: shareLinkPayload,
    isLoading: isShareLinkLoading,
    error: shareLinkError,
    mutate: revalidateShareLink,
  } = useSharePreview(slug, { passcode: submittedPasscode });

  const { toggleUpvote, toggleBookmark } = useSnippetMutations();

  const snippetId = shareLinkPayload?.snippet?.id ?? "";
  const authorId = shareLinkPayload?.snippet?.user?.id ?? "";
  const { data: authorProfile } = useUserProfile(authorId || null);

  const isMutationPending = useRef(false);

  const executeOptimisticToggle = useCallback(
    async (optimisticPayload: Record<string, unknown>, mutationFn: () => Promise<unknown>, errorMessage: string) => {
      if (isMutationPending.current) return;
      isMutationPending.current = true;
      revalidateShareLink(optimisticPayload as any, false);
      try {
        await mutationFn();
        revalidateShareLink();
      } catch {
        toast.error(errorMessage);
        revalidateShareLink();
      } finally {
        isMutationPending.current = false;
      }
    },
    [revalidateShareLink],
  );

  const handleUpvoteToggle = async () => {
    if (!shareLinkPayload?.currentUserId) return toast.error("Sign in to upvote.");
    if (!snippetId) return;
    await executeOptimisticToggle(
      buildUpvoteOptimisticPayload(shareLinkPayload),
      () => toggleUpvote(snippetId),
      "Failed to upvote.",
    );
  };

  const handleBookmarkToggle = async () => {
    if (!shareLinkPayload?.currentUserId) return toast.error("Sign in to bookmark.");
    if (!snippetId) return;
    await executeOptimisticToggle(
      buildBookmarkOptimisticPayload(shareLinkPayload),
      () => toggleBookmark(snippetId),
      "Failed to bookmark.",
    );
  };

  const isInitialLoadPending = isShareLinkLoading && !submittedPasscode;
  const isPasscodeVerifying = isShareLinkLoading && !!submittedPasscode;
  // tRPC errors surfaced by SWR expose the code at err.data.code
  const trpcErrorCode = (shareLinkError as any)?.data?.code as string | undefined;
  const isPasscodeRequired = trpcErrorCode === "FORBIDDEN";
  // Only show the invalid-passcode error when a code was submitted and we got a FORBIDDEN back (not loading)
  const isInvalidPasscode = !!submittedPasscode && isPasscodeRequired && !isPasscodeVerifying;

  const snippetRecord = shareLinkPayload?.snippet;

  // @ts-ignore - presentation is a JSONB
  const presentationConfig = snippetRecord?.presentation as {
    elements?: Record<string, any>;
    slideElements?: Record<string, string[]>;
    width?: number;
  } | null;

  const presentationElements = presentationConfig?.elements;
  const slideElementMap = presentationConfig?.slideElements;
  const resolvedElementIds: string[] = slideElementMap
    ? (Object.values(slideElementMap).flat() as string[])
    : Object.keys(presentationElements ?? {});

  return {
    // passcode
    passcodeInput,
    setPasscodeInput,
    submittedPasscode,
    setSubmittedPasscode,
    // state flags
    isInitialLoadPending,
    isPasscodeVerifying,
    isPasscodeRequired,
    isInvalidPasscode,
    // snippet data
    shareLinkPayload,
    snippetRecord,
    hasUserUpvoted: shareLinkPayload?.userUpvoted,
    hasUserBookmarked: shareLinkPayload?.userBookmarked,
    isAuthorFollowed: shareLinkPayload?.isFollowing,
    authenticatedUserId: shareLinkPayload?.currentUserId,
    // author profile
    authorFollowerCount: authorProfile?._count?.followers ?? 0,
    authorFollowingCount: authorProfile?._count?.following ?? 0,
    // presentation
    presentationConfig,
    presentationElements,
    resolvedElementIds,
    // handlers
    handleUpvoteToggle,
    handleBookmarkToggle,
  };
}
