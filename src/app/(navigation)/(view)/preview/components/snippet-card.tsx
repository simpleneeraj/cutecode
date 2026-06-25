"use client";

import React from "react";
import View from "@/components/view";
import { Badge } from "@/components/ui/badge";
import { Card, CardFooter, CardHeader, CardPanel, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import FollowButton from "@/components/follow-button";
import FollowersDialog from "@/components/followers-dialog";
import { SnippetActions } from "./snippet-actions";
import MoreOptions from "./more-options";
import { Plan } from "@/generated/prisma/enums";

type SnippetAuthor = {
  id?: string;
  name?: string | null;
  supabaseId?: string;
  plan?: string;
};

type SnippetCardProps = {
  slug: string;
  children: React.ReactNode;
  author?: SnippetAuthor;
  title?: string | null;
  description?: string | null;
  tags?: string[];
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
  renderComments?: () => React.ReactNode;
};

export function SnippetCard({
  slug,
  children,
  author,
  title,
  description,
  tags = ["swiftui", "ios"],
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
  renderComments,
}: SnippetCardProps) {
  const authorId = author?.id ?? "";
  const handle = `@${author?.name?.replace(/\s+/g, "").toLowerCase() || "user"}`;

  return (
    <Card className="w-full bg-background/50 backdrop-blur-lg">
      <CardHeader>
        <CardTitle>
          <View className="flex items-center justify-between">
            <View className="flex items-center gap-3">
              <Avatar className="size-10 shrink-0 ring-2 ring-border">
                <AvatarFallback className="bg-foreground text-background text-sm font-semibold">
                  {author?.name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold leading-tight">{author?.name || "Anonymous"}</span>
                  {author?.plan && author.plan !== Plan.FREE && (
                    <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                      {author.plan}
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground leading-tight">{handle}</div>
                <FollowersDialog
                  userId={authorId}
                  currentUserId={currentUserId}
                  followerCount={followerCount}
                  followingCount={followingCount}
                />
              </div>
            </View>

            <View className="flex items-center gap-2">
              <FollowButton
                targetUserId={authorId}
                currentUserId={currentUserId}
                initialIsFollowing={isFollowing}
                initialFollowerCount={followerCount}
              />
              <MoreOptions slug={slug} currentUserId={currentUserId} authorId={authorId} />
            </View>
          </View>
        </CardTitle>
      </CardHeader>

      <CardPanel>
        <View className="flex flex-col gap-3">
          {title && <h2 className="text-base font-semibold leading-snug">{title}</h2>}
          {description && (
            <article className="prose prose-sm dark:prose-invert">
              <p>{description}</p>
            </article>
          )}
          <View className="flex flex-col gap-0 rounded-lg overflow-hidden border border-border">{children}</View>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <Badge variant="outline" className="text-xxs" key={tag}>
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </View>
      </CardPanel>

      <CardFooter>
        <SnippetActions
          slug={slug}
          upvoted={upvoted}
          upvoteCount={upvoteCount}
          bookmarked={bookmarked}
          bookmarkCount={bookmarkCount}
          commentCount={commentCount}
          onUpvote={onUpvote}
          onBookmark={onBookmark}
          renderComments={renderComments}
        />
      </CardFooter>
    </Card>
  );
}
