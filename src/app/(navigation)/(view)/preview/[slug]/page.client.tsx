// preview-snippet-client.tsx
"use client";

import React from "react";
import View from "@/components/view";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { PasscodeGate } from "../components/passcode-gate";
import { SnippetFrame } from "../components/snippet-frame";
import { SnippetCard } from "../components/snippet-card";
import { PreviewLoading } from "../components/preview-loading";
import SnippetNotFound from "../components/preview-not-found";
import MaskWallpaper from "@/plugings/mask-wallpaper";
import { useSnippetPreview } from "../hooks/use-snippet-preview";
import { useAtomValue } from "jotai";
import { wallpaperOptionsAtom } from "@/store/preview/wallpaper-atom";
import SnippetInfo from "../components/snippet-info";
import copy from "copy-to-clipboard";

type PreviewSnippetClientProps = { slug: string };

export default function PreviewSnippetClient({ slug }: PreviewSnippetClientProps) {
  const wallpaperOptions = useAtomValue(wallpaperOptionsAtom);

  const {
    passcodeInput,
    setPasscodeInput,
    setSubmittedPasscode,
    isInitialLoadPending,
    isPasscodeVerifying,
    isPasscodeRequired,
    isInvalidPasscode,
    snippetRecord,
    hasUserUpvoted,
    hasUserBookmarked,
    isAuthorFollowed,
    authenticatedUserId,
    authorFollowerCount,
    authorFollowingCount,
    presentationConfig,
    presentationElements,
    resolvedElementIds,
    handleUpvoteToggle,
    handleBookmarkToggle,
    shareLinkPayload,
  } = useSnippetPreview(slug);

  const [copied, setCopied] = React.useState(false);
  const onCopy = (content: string) => {
    copy(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isInitialLoadPending) return <PreviewLoading />;

  if (isPasscodeRequired || isPasscodeVerifying) {
    return (
      <PasscodeGate
        passcode={passcodeInput}
        onChange={(val) => {
          setPasscodeInput(val);
          // Clear the submitted passcode so error resets when user retypes
          if (isInvalidPasscode) setSubmittedPasscode("");
        }}
        isLoading={isPasscodeVerifying}
        onSubmit={() => setSubmittedPasscode(passcodeInput)}
        invalidPasscode={isInvalidPasscode}
      />
    );
  }

  if (!snippetRecord) return <SnippetNotFound />;

  return (
    <React.Fragment>
      <MaskWallpaper options={wallpaperOptions} className="absolute top-0 left-0 w-full h-full z-0" />
      <View className="layout-scroll flex-2 gap-3">
        <View className="flex flex-row gap-3 z-10 max-w-3xl mx-auto w-full p-2 relative">
          <View className="flex flex-col flex-2 gap-3 relative">
            <View className="flex items-center justify-center">
              <Badge variant="secondary" className="bg-background/75 backdrop-blur-lg">
                Snippet Created
              </Badge>
            </View>
            <View className="flex items-center justify-center">
              <Badge variant="secondary" className="bg-background/75 backdrop-blur-lg">
                {format(new Date(snippetRecord.createdAt), "MMMM d, yyyy")}
              </Badge>
            </View>

            <SnippetCard
              slug={slug}
              author={snippetRecord.user ?? undefined}
              description={snippetRecord.description}
              commentCount={snippetRecord._count?.comments ?? 0}
              upvoted={hasUserUpvoted!}
              upvoteCount={snippetRecord._count?.upvotes ?? 0}
              bookmarked={hasUserBookmarked!}
              bookmarkCount={snippetRecord._count?.bookmarks ?? 0}
              isFollowing={isAuthorFollowed}
              followerCount={authorFollowerCount}
              followingCount={authorFollowingCount}
              currentUserId={authenticatedUserId}
              onUpvote={handleUpvoteToggle}
              onBookmark={handleBookmarkToggle}
              tags={snippetRecord.tags ?? []}
              title={snippetRecord.title ?? ""}
            >
              <View className="flex flex-col">
                {resolvedElementIds.map((elementId) => {
                  const presentationElement = presentationElements?.[elementId];
                  if (!presentationElement) return null;
                  return (
                    <React.Fragment key={elementId}>
                      <SnippetFrame
                        elementId={elementId}
                        element={presentationElement}
                        windowWidth={presentationConfig?.width ?? 800}
                      />
                      <SnippetInfo
                        copied={copied}
                        viewCount={shareLinkPayload?.shareLink?.viewCount ?? 0}
                        language={presentationElement?.properties?.language}
                        onCopy={() => onCopy(presentationElement?.content)}
                      />
                    </React.Fragment>
                  );
                })}
              </View>
            </SnippetCard>
          </View>
        </View>
      </View>
    </React.Fragment>
  );
}
