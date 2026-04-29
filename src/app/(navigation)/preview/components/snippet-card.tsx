"use client";

import React from "react";
import View from "@/components/view";
import { EllipsisVerticalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardFooter, CardHeader, CardPanel, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import FollowButton from "@/components/follow-button";
import FollowersDialog from "@/components/followers-dialog";
import { SnippetActions } from "./snippet-actions";

type SnippetAuthor = {
  id?: string;
  name?: string | null;
  clerkId?: string;
  plan?: string;
};

type SnippetCardProps = {
  children: React.ReactNode;
  author?: SnippetAuthor;
  description?: string | null;
  commentCount: number;
  upvoted: boolean;
  upvoteCount: number;
  bookmarked: boolean;
  bookmarkCount: number;
  isFollowing?: boolean;
  followerCount: number;
  followingCount: number;
  currentUserId?: string;
  onUpvote: () => void;
  onBookmark: () => void;
};

export function SnippetCard({
  children,
  author,
  description,
  commentCount,
  upvoted,
  upvoteCount,
  bookmarked,
  bookmarkCount,
  isFollowing,
  followerCount,
  followingCount,
  currentUserId,
  onUpvote,
  onBookmark,
}: SnippetCardProps) {
  const authorId  = author?.id ?? "";
  const avatarUrl = author?.clerkId
    ? `https://img.clerk.com/preview.png?size=80&seed=${author.clerkId}`
    : undefined;

  const handle = `@${author?.name?.replace(/\s+/g, "").toLowerCase() || "user"}`;

  return (
    <Card className="w-full bg-background/50 backdrop-blur-lg">
      {/* ── Header: author + follow ─────────────────────────────── */}
      <CardHeader>
        <CardTitle>
          <View className="flex items-center justify-between">
            <View className="flex items-center gap-3">
              <Avatar className="size-10 shrink-0 ring-2 ring-border">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="text-sm font-semibold">
                  {author?.name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="text-left">
                {/* Name + plan badge */}
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold leading-tight">
                    {author?.name || "Anonymous"}
                  </span>
                  {author?.plan && author.plan !== "FREE" && (
                    <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                      {author.plan}
                    </Badge>
                  )}
                </div>

                {/* Handle */}
                <div className="text-xs text-muted-foreground leading-tight">{handle}</div>

                {/* Follower / following counts — opens dialog */}
                {authorId && (
                  <FollowersDialog
                    userId={authorId}
                    currentUserId={currentUserId}
                    followerCount={followerCount}
                    followingCount={followingCount}
                  >
                    <button className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                      <span>
                        <strong className="text-foreground tabular-nums">
                          {followerCount.toLocaleString()}
                        </strong>{" "}
                        {followerCount === 1 ? "follower" : "followers"}
                      </span>
                      <span className="text-border">·</span>
                      <span>
                        <strong className="text-foreground tabular-nums">
                          {followingCount.toLocaleString()}
                        </strong>{" "}
                        following
                      </span>
                    </button>
                  </FollowersDialog>
                )}
              </div>
            </View>

            {/* Follow + more options */}
            <View className="flex items-center gap-2">
              <FollowButton
                targetUserId={authorId}
                currentUserId={currentUserId}
                initialIsFollowing={isFollowing}
                initialFollowerCount={followerCount}
              />
              <Button variant="outline" size="sm" aria-label="More options">
                <EllipsisVerticalIcon className="size-4" aria-hidden />
              </Button>
            </View>
          </View>
        </CardTitle>
      </CardHeader>

      {/* ── Body: description + frames ──────────────────────────── */}
      <CardPanel>
        <View className="flex flex-col gap-2">
          {description && (
            <article className="prose prose-sm dark:prose-invert">
              <p>{description}</p>
            </article>
          )}
          <View className="flex flex-col gap-2 rounded-lg overflow-hidden">
            {children}
          </View>
        </View>
      </CardPanel>

      {/* ── Footer: actions ─────────────────────────────────────── */}
      <CardFooter>
        <SnippetActions
          upvoted={upvoted}
          upvoteCount={upvoteCount}
          bookmarked={bookmarked}
          bookmarkCount={bookmarkCount}
          commentCount={commentCount}
          onUpvote={onUpvote}
          onBookmark={onBookmark}
        />
      </CardFooter>
    </Card>
  );
}
