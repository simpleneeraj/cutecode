"use client";

import React, { useState } from "react";
import View from "@/components/view";
import { ArrowBigUpDash, Blend, BookmarkIcon, MessageCircle, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipPopup, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { EmbedDialog } from "./embed-dialog";
import { ShareDialog } from "./share-dialog";

type SnippetActionsProps = {
  slug: string;
  upvoted?: boolean;
  upvoteCount: number;
  bookmarked?: boolean;
  bookmarkCount: number;
  commentCount: number;
  onUpvote: () => void;
  onBookmark: () => void;
  /** Optional: render prop for inline comments panel */
  renderComments?: () => React.ReactNode;
};

export function SnippetActions({
  slug,
  upvoted,
  upvoteCount,
  bookmarked,
  bookmarkCount,
  commentCount,
  onUpvote,
  onBookmark,
  renderComments,
}: SnippetActionsProps) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [isRemixing, setIsRemixing] = useState(false);

  const handleRemix = () => {
    setIsRemixing(true);
    window.location.href = `/remix/${slug}`;
  };

  return (
    <div className="flex flex-col gap-0 w-full">
      <div className="flex gap-2 justify-between w-full">
        <View className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant={upvoted ? "default" : "outline"}
                    className="gap-2"
                    onClick={onUpvote}
                    aria-label={upvoted ? "Remove upvote" : "Upvote"}
                    aria-pressed={upvoted}
                  >
                    <ArrowBigUpDash className="size-4 shrink-0" aria-hidden />
                    <span className="tabular-nums">{upvoteCount}</span>
                  </Button>
                }
              />
              <TooltipPopup>Upvote</TooltipPopup>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant={commentsOpen ? "default" : "outline"}
                    className="gap-2"
                    aria-label={commentsOpen ? "Hide comments" : "Show comments"}
                    aria-expanded={commentsOpen}
                    onClick={() => setCommentsOpen((prev) => !prev)}
                  >
                    <MessageCircle className="size-4 shrink-0" aria-hidden />
                    <span className="tabular-nums">{commentCount}</span>
                    {commentsOpen ? (
                      <ChevronUp className="size-3 shrink-0 ml-0.5" aria-hidden />
                    ) : (
                      <ChevronDown className="size-3 shrink-0 ml-0.5" aria-hidden />
                    )}
                  </Button>
                }
              />
              <TooltipPopup>{commentsOpen ? "Hide comments" : "Show comments"}</TooltipPopup>
            </Tooltip>
          </TooltipProvider>
        </View>

        <View className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant={bookmarked ? "default" : "outline"}
                    className="gap-2"
                    onClick={onBookmark}
                    aria-label={bookmarked ? "Remove bookmark" : "Bookmark"}
                    aria-pressed={bookmarked}
                  >
                    <BookmarkIcon className="size-4 shrink-0" aria-hidden />
                    <span className="tabular-nums">{bookmarkCount}</span>
                  </Button>
                }
              />
              <TooltipPopup>Save</TooltipPopup>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={handleRemix}
                    aria-label="Remix in editor"
                    disabled={isRemixing}
                  >
                    {isRemixing ? (
                      <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
                    ) : (
                      <Blend className="size-4 shrink-0" aria-hidden />
                    )}
                    <span>{isRemixing ? "Remixing..." : "Remix"}</span>
                  </Button>
                }
              />
              <TooltipPopup>Remix in Editor</TooltipPopup>
            </Tooltip>

            <EmbedDialog slug={slug} />
            <ShareDialog slug={slug} />
          </TooltipProvider>
        </View>
      </div>

      {commentsOpen && (
        <div className="mt-3 border-t border-border pt-3">
          {renderComments ? (
            renderComments()
          ) : (
            <p className="text-sm text-muted-foreground">No comments yet. Be the first to comment.</p>
          )}
        </div>
      )}
    </div>
  );
}
