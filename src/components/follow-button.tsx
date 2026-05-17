"use client";

import { cn } from "@/utils/cn";
import React, { useState } from "react";
import { toast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { Loader2, UserCheck, UserPlus } from "lucide-react";
import { useUserMutations, useUserProfile } from "@/hooks/use-user";

interface FollowButtonProps {
  /** DB user ID of the person to follow */
  targetUserId: string;
  /** DB user ID of the logged-in viewer (undefined = not signed in) */
  currentUserId?: string;
  /** Initial follow state from the preview payload (avoids extra fetch) */
  initialIsFollowing?: boolean;
  /** Initial follower count */
  initialFollowerCount?: number;
  /** If true, show follower count next to the button */
  showCount?: boolean;
  className?: string;
  size?: "sm" | "default" | "lg";
}

/**
 * Reusable follow/unfollow button with:
 *  - Optimistic UI
 *  - Loading spinner (no double-submit)
 *  - Auth guard
 *  - Self-follow prevention
 *  - Local state sync so the count updates instantly
 */
export function FollowButton({
  targetUserId,
  currentUserId,
  initialIsFollowing = false,
  initialFollowerCount = 0,
  showCount = false,
  className,
  size = "sm",
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [isHovering, setIsHovering] = useState(false);

  const [isFollowPending, setIsFollowPending] = useState(false);

  const { toggleFollow } = useUserMutations();
  // Revalidate the public profile in the background after toggle
  const { mutate: mutateProfile } = useUserProfile(targetUserId);

  const isOwnProfile = !!currentUserId && currentUserId === targetUserId;

  if (isOwnProfile) return null;

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!currentUserId) {
      toast.error("Sign in to follow users.");
      return;
    }

    if (isFollowPending) return;

    // Optimistic update
    const next = !isFollowing;
    setIsFollowing(next);
    setFollowerCount((c) => c + (next ? 1 : -1));
    setIsFollowPending(true);

    try {
      const res = await toggleFollow(targetUserId);
      // Sync with server truth
      if (typeof res?.followerCount === "number") setFollowerCount(res.followerCount);
      setIsFollowing(res?.following ?? next);
    } catch {
      // Revert on failure
      setIsFollowing(!next);
      setFollowerCount((c) => c + (!next ? 1 : -1));
      toast.error(next ? "Could not follow user." : "Could not unfollow user.");
    } finally {
      setIsFollowPending(false);
      mutateProfile(); // refresh profile counts
    }
  };

  const label = isFollowing ? (isHovering ? "Unfollow" : "Following") : "Follow";

  const Icon = isFollowPending ? Loader2 : isFollowing ? UserCheck : UserPlus;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isFollowing ? "outline" : "default"}
        size={size}
        onClick={handleClick}
        disabled={isFollowPending}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        aria-label={isFollowing ? "Unfollow this user" : "Follow this user"}
        aria-pressed={isFollowing}
        className={cn(
          "gap-1.5 transition-all",
          isFollowing && isHovering && "border-destructive text-destructive hover:bg-destructive/10",
          className,
        )}
      >
        <Icon className={cn("size-3.5", isFollowPending && "animate-spin")} aria-hidden="true" />
        {label}
      </Button>

      {showCount && (
        <span className="text-xs text-muted-foreground tabular-nums">
          {followerCount.toLocaleString()} {followerCount === 1 ? "follower" : "followers"}
        </span>
      )}
    </div>
  );
}

export default FollowButton;
