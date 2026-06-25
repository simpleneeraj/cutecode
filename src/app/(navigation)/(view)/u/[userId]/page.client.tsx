"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { UsersGroupRounded } from "@solar-icons/react";
import { useUserProfile, useUserMutations } from "@/hooks/use-user";
import { useSnippetExplore } from "@/hooks/use-snippet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ExploreSnippetCard } from "../../explore/components/explore-snippet-card";
import { SLIDE_UP, EASE_OUT } from "@/lib/motion";
import View from "@/components/view";
import { useUser } from "@/hooks/use-auth";

type ProfilePageClientProps = {
  userId: string;
};

export default function ProfilePageClient({ userId }: ProfilePageClientProps) {
  const { user: currentClerkUser } = useUser();
  const { data: profile, isLoading: profileLoading, mutate: mutateProfile } = useUserProfile(userId);
  const { data: snippetsData, isLoading: snippetsLoading } = useSnippetExplore({ limit: 12 });

  const { toggleFollow } = useUserMutations();
  const [isFollowPending, setIsFollowPending] = useState(false);

  const snippets =
    snippetsData?.snippets?.filter((s) => s.user?.id === userId) ?? [];

  async function handleFollowToggle() {
    if (!profile) return;
    setIsFollowPending(true);
    try {
      await toggleFollow(userId);
      await mutateProfile();
    } finally {
      setIsFollowPending(false);
    }
  }

  if (profileLoading) {
    return (
      <View className="layout-fill flex flex-col gap-6 py-10 px-4 max-w-3xl mx-auto w-full">
        <div className="flex items-center gap-4">
          <Skeleton className="size-16 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-40 rounded-xl" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View className="layout-fill flex items-center justify-center">
        <p className="text-muted-foreground text-sm">User not found.</p>
      </View>
    );
  }

  const authorInitial = (profile.name || profile.email).charAt(0).toUpperCase();
  const isOwnProfile = profile.isOwnProfile;

  return (
    <View className="layout-fill layout-scroll">
      <View className="flex flex-col gap-8 py-10 px-4 max-w-3xl mx-auto w-full">
        {/* Profile header */}
        <motion.div
          {...SLIDE_UP}
          transition={{ duration: 0.3, ease: EASE_OUT }}
          className="flex flex-col sm:flex-row sm:items-end gap-5"
        >
          {/* Avatar */}
          <div
            className="flex size-20 items-center justify-center rounded-2xl text-3xl font-bold shrink-0"
            style={{ background: "hsl(var(--brand-subtle))", color: "hsl(var(--brand))" }}
          >
            {authorInitial}
          </div>

          {/* Info */}
          <div className="flex-1 flex flex-col gap-1.5">
            <h1 className="text-2xl font-bold tracking-tight">{profile.name || "Anonymous"}</h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary" className="capitalize text-xs">
                {profile.plan.toLowerCase()}
              </Badge>
              <span className="flex items-center gap-1">
                <UsersGroupRounded weight="LineDuotone" className="size-3.5" aria-hidden="true" />
                {profile._count.followers}{" "}
                {profile._count.followers === 1 ? "follower" : "followers"}
              </span>
              <span className="text-muted-foreground/50">·</span>
              <span>{profile._count.following} following</span>
            </div>
          </div>

          {/* Follow button */}
          {!isOwnProfile && currentClerkUser && (
            <Button
              variant={profile.isFollowing ? "outline" : "default"}
              size="sm"
              onClick={handleFollowToggle}
              disabled={isFollowPending}
              className="self-start sm:self-auto"
            >
              {profile.isFollowing ? "Unfollow" : "Follow"}
            </Button>
          )}
        </motion.div>

        {/* Snippets */}
        <motion.div
          {...SLIDE_UP}
          transition={{ duration: 0.3, delay: 0.1, ease: EASE_OUT }}
          className="flex flex-col gap-4"
        >
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Public Snippets
          </h2>

          <AnimatePresence mode="wait">
            {snippetsLoading ? (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-48 rounded-xl" />
                ))}
              </motion.div>
            ) : snippets.length === 0 ? (
              <motion.p
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-muted-foreground"
              >
                No public snippets yet.
              </motion.p>
            ) : (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                {snippets.map((snippet, i) => (
                  <ExploreSnippetCard key={snippet.id} snippet={snippet} index={i} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </View>
    </View>
  );
}
