"use client";

import React from "react";
import View from "@/components/view";
import {
  ArrowBigUpDash,
  Blend,
  BookmarkIcon,
  MessageCircle,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipPopup, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/components/toast";
import { shortenUrl } from "@/utils/common";

import { EmbedDialog } from "./embed-dialog";

type SnippetActionsProps = {
  slug: string;
  upvoted?: boolean;
  upvoteCount: number;
  bookmarked?: boolean;
  bookmarkCount: number;
  commentCount: number;
  onUpvote: () => void;
  onBookmark: () => void;
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
}: SnippetActionsProps) {
  const handleShare = async () => {
    try {
      const url = window.location.href;
      const shortUrl = await shortenUrl(url, "snippets").catch(() => url);
      await navigator.clipboard.writeText(shortUrl);
      toast.success("Link copied to clipboard.");
    } catch {
      toast.error("Could not copy link.");
    }
  };

  const handleRemix = () => {
    window.location.href = `/?remix=${slug}`;
  };

  return (
    <div className="flex gap-2 justify-between w-full">
      {/* ── Left: upvote + comments ─────────────────────────────── */}
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
                <Button variant="outline" className="gap-2" aria-label="Comments">
                  <MessageCircle className="size-4 shrink-0" aria-hidden />
                  <span className="tabular-nums">{commentCount}</span>
                </Button>
              }
            />
            <TooltipPopup>Comments</TooltipPopup>
          </Tooltip>
        </TooltipProvider>
      </View>

      {/* ── Right: bookmark + remix + embed + share ─────────────────── */}
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
                <Button variant="outline" className="gap-2" onClick={handleRemix} aria-label="Remix in editor">
                  <Blend className="size-4 shrink-0" aria-hidden />
                  <span>Remix</span>
                </Button>
              }
            />
            <TooltipPopup>Remix in Editor</TooltipPopup>
          </Tooltip>

          <EmbedDialog slug={slug} />

          <Tooltip>
            <TooltipTrigger
              render={
                <Button variant="outline" className="gap-2" onClick={handleShare} aria-label="Share snippet">
                  <Share2 className="size-4 shrink-0" aria-hidden />
                  <span>Share</span>
                </Button>
              }
            />
            <TooltipPopup>Copy Link</TooltipPopup>
          </Tooltip>
        </TooltipProvider>
      </View>
    </div>
  );
}
