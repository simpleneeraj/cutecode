"use client";

import React, { useState } from "react";
import { Dialog, DialogTrigger, DialogPopup, DialogHeader, DialogTitle, DialogPanel } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useUserFollowers, useUserFollowing, type UserFollowersOutput } from "@/hooks/use-user";

export type FollowUser = UserFollowersOutput["users"][number];
import FollowButton from "@/components/follow-button";
import { Badge } from "@/components/ui/badge";
import View from "./view";
import { Tabs, TabsList, TabsPanel, TabsTab } from "./ui/tabs";
import { Plan } from "@/generated/prisma/enums";

function UserRow({ user, currentUserId }: { user: FollowUser; currentUserId?: string }) {
  const avatarUrl = user.name ? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}` : undefined;

  const handle = user.name?.replace(/\s+/g, "").toLowerCase() || "user";

  return (
    <div className="flex items-center gap-3 py-3 border-b border-border/50 last:border-0">
      <Avatar className="size-10 shrink-0">
        <AvatarImage src={avatarUrl} />
        <AvatarFallback className="text-sm font-medium">{user.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium truncate">{user.name || "Anonymous"}</p>
          {user.plan !== Plan.FREE && (
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

function FollowersList({ userId, currentUserId }: { userId: string; currentUserId?: string }) {
  const [cursor, setCursor] = useState<string | undefined>();
  const [allUsers, setAllUsers] = useState<FollowUser[]>([]);
  const [localNextCursor, setLocalNextCursor] = useState<string | null>(null);
  const { data, isLoading } = useUserFollowers(userId, cursor);

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
        <Spinner className="size-5 text-muted-foreground" />
      </div>
    );
  }

  if (!isLoading && allUsers.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No followers yet.</p>;
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
          {isLoading ? <Spinner className="size-4" /> : "Load more"}
        </Button>
      )}
    </div>
  );
}

// ─── Following List ────────────────────────────────────────────────────────────

function FollowingList({ userId, currentUserId }: { userId: string; currentUserId?: string }) {
  const [cursor, setCursor] = useState<string | undefined>();
  const [allUsers, setAllUsers] = useState<FollowUser[]>([]);
  const [localNextCursor, setLocalNextCursor] = useState<string | null>(null);
  const { data, isLoading } = useUserFollowing(userId, cursor);

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
        <Spinner className="size-5 text-muted-foreground" />
      </div>
    );
  }

  if (!isLoading && allUsers.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">Not following anyone yet.</p>;
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
          {isLoading ? <Spinner className="size-4" /> : "Load more"}
        </Button>
      )}
    </div>
  );
}

// ─── Main Export ───────────────────────────────────────────────────────────────

enum Tab {
  Followers = "followers",
  Following = "following",
}

interface FollowersDialogProps {
  userId: string;
  currentUserId?: string;
  followerCount: number;
  followingCount: number;
}

export function FollowersDialog({ userId, currentUserId, followerCount, followingCount }: FollowersDialogProps) {
  const [tab, setTab] = useState<Tab>(Tab.Followers);
  const [open, setOpen] = useState(false);

  const onOpenTabs = (tab: Tab) => {
    setOpen(true);
    setTab(tab);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* <DialogTrigger> */}
      <View className="flex">
        <Button size={"xs"} variant={"ghost"} onClick={() => onOpenTabs(Tab.Followers)}>
          <span>
            <strong className="text-foreground tabular-nums">{followerCount.toLocaleString()}</strong>{" "}
            {followerCount === 1 ? "follower" : "followers"}
          </span>
        </Button>
        <Button size={"xs"} variant={"ghost"} onClick={() => onOpenTabs(Tab.Following)}>
          <span>
            <strong className="text-foreground tabular-nums">{followingCount.toLocaleString()}</strong> following
          </span>
        </Button>
      </View>
      {/* </DialogTrigger> */}
      <Tabs value={tab} onValueChange={setTab}>
        <DialogPopup className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Connections</DialogTitle>
            <TabsList>
              <TabsTab value={Tab.Followers}>{Tab.Followers}</TabsTab>
              <TabsTab value={Tab.Following}>{Tab.Following}</TabsTab>
            </TabsList>
          </DialogHeader>
          <DialogPanel className="max-h-[60vh] overflow-y-auto pr-1">
            <TabsPanel value={Tab.Followers}>
              <FollowersList userId={userId} currentUserId={currentUserId} />
            </TabsPanel>
            <TabsPanel value={Tab.Following}>
              <FollowingList userId={userId} currentUserId={currentUserId} />
            </TabsPanel>
          </DialogPanel>
        </DialogPopup>
      </Tabs>
    </Dialog>
  );
}

export default FollowersDialog;
