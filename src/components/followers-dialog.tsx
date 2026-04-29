"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogPopup,
  DialogHeader,
  DialogTitle,
  DialogPanel,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useFollowers, useFollowing, type FollowUser } from "@/services/snippet";
import FollowButton from "@/components/follow-button";
import { Badge } from "@/components/ui/badge";

// ─── User Row ─────────────────────────────────────────────────────────────────

function UserRow({ user, currentUserId }: { user: FollowUser; currentUserId?: string }) {
  const avatarUrl = user.clerkId
    ? `https://img.clerk.com/preview.png?size=64&seed=${user.clerkId}`
    : undefined;

  const handle = user.name?.replace(/\s+/g, "").toLowerCase() || "user";

  return (
    <div className="flex items-center gap-3 py-3 border-b border-border/50 last:border-0">
      <Avatar className="size-10 shrink-0">
        <AvatarImage src={avatarUrl} />
        <AvatarFallback className="text-sm font-medium">
          {user.name?.[0]?.toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium truncate">{user.name || "Anonymous"}</p>
          {user.plan !== "FREE" && (
            <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 shrink-0">
              {user.plan}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">@{handle}</p>
        <p className="text-xs text-muted-foreground">
          {user._count.followers.toLocaleString()} follower{user._count.followers !== 1 ? "s" : ""}
        </p>
      </div>

      <FollowButton
        targetUserId={user.id}
        currentUserId={currentUserId}
        initialIsFollowing={user.isFollowing}
        initialFollowerCount={user._count.followers}
      />
    </div>
  );
}

// ─── Followers List ────────────────────────────────────────────────────────────

function FollowersList({
  userId,
  currentUserId,
}: {
  userId: string;
  currentUserId?: string;
}) {
  const [cursor, setCursor] = useState<string | undefined>();
  const [allUsers, setAllUsers] = useState<FollowUser[]>([]);
  const [localNextCursor, setLocalNextCursor] = useState<string | null>(null);
  const { data, isLoading } = useFollowers(userId, cursor);

  React.useEffect(() => {
    if (!data) return;
    setAllUsers((prev) => {
      const ids = new Set(prev.map((u) => u.id));
      const fresh = data.users.filter((u) => !ids.has(u.id));
      return [...prev, ...fresh];
    });
    setLocalNextCursor(data.nextCursor);
  }, [data]);

  if (isLoading && allUsers.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="animate-spin size-5 text-muted-foreground" />
      </div>
    );
  }

  if (!isLoading && allUsers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">No followers yet.</p>
    );
  }

  return (
    <div className="flex flex-col">
      {allUsers.map((u) => (
        <UserRow key={u.id} user={u} currentUserId={currentUserId} />
      ))}
      {localNextCursor && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 mx-auto"
          disabled={isLoading}
          onClick={() => setCursor(localNextCursor)}
        >
          {isLoading ? <Loader2 className="animate-spin size-4" /> : "Load more"}
        </Button>
      )}
    </div>
  );
}

// ─── Following List ────────────────────────────────────────────────────────────

function FollowingList({
  userId,
  currentUserId,
}: {
  userId: string;
  currentUserId?: string;
}) {
  const [cursor, setCursor] = useState<string | undefined>();
  const [allUsers, setAllUsers] = useState<FollowUser[]>([]);
  const [localNextCursor, setLocalNextCursor] = useState<string | null>(null);
  const { data, isLoading } = useFollowing(userId, cursor);

  React.useEffect(() => {
    if (!data) return;
    setAllUsers((prev) => {
      const ids = new Set(prev.map((u) => u.id));
      const fresh = data.users.filter((u) => !ids.has(u.id));
      return [...prev, ...fresh];
    });
    setLocalNextCursor(data.nextCursor);
  }, [data]);

  if (isLoading && allUsers.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="animate-spin size-5 text-muted-foreground" />
      </div>
    );
  }

  if (!isLoading && allUsers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">Not following anyone yet.</p>
    );
  }

  return (
    <div className="flex flex-col">
      {allUsers.map((u) => (
        <UserRow key={u.id} user={u} currentUserId={currentUserId} />
      ))}
      {localNextCursor && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 mx-auto"
          disabled={isLoading}
          onClick={() => setCursor(localNextCursor)}
        >
          {isLoading ? <Loader2 className="animate-spin size-4" /> : "Load more"}
        </Button>
      )}
    </div>
  );
}

// ─── Main Export ───────────────────────────────────────────────────────────────

type Tab = "followers" | "following";

interface FollowersDialogProps {
  userId: string;
  currentUserId?: string;
  followerCount: number;
  followingCount: number;
  children: React.ReactNode; // trigger
}

export function FollowersDialog({
  userId,
  currentUserId,
  followerCount,
  followingCount,
  children,
}: FollowersDialogProps) {
  const [tab, setTab] = useState<Tab>("followers");

  return (
    <Dialog>
      <DialogTrigger render={<button className="text-left" />}>{children}</DialogTrigger>
      <DialogPopup className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Connections</DialogTitle>

          {/* Tab bar */}
          <div className="flex gap-1 mt-2 p-1 bg-muted rounded-lg">
            <button
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-all ${
                tab === "followers"
                  ? "bg-background shadow text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setTab("followers")}
            >
              Followers
              <span className="ml-1.5 tabular-nums text-xs text-muted-foreground">
                {followerCount.toLocaleString()}
              </span>
            </button>
            <button
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-all ${
                tab === "following"
                  ? "bg-background shadow text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setTab("following")}
            >
              Following
              <span className="ml-1.5 tabular-nums text-xs text-muted-foreground">
                {followingCount.toLocaleString()}
              </span>
            </button>
          </div>
        </DialogHeader>

        <DialogPanel className="max-h-[60vh] overflow-y-auto pr-1">
          {tab === "followers" ? (
            <FollowersList userId={userId} currentUserId={currentUserId} />
          ) : (
            <FollowingList userId={userId} currentUserId={currentUserId} />
          )}
        </DialogPanel>
      </DialogPopup>
    </Dialog>
  );
}

export default FollowersDialog;
