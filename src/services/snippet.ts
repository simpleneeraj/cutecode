import useSWR from "swr";
import useSWRMutation from "swr/mutation";

const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const err: any = new Error(body?.message || "Failed to fetch");
    err.status = res.status;
    if (body) Object.assign(err, body);
    throw err;
  }
  return res.json();
};

const toggler = async (url: string) => {
  const res = await fetch(url, { method: "POST", credentials: "include" });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const err: any = new Error(body?.message || "Request failed");
    err.status = res.status;
    throw err;
  }
  return res.json();
};

const poster = async (url: string, { arg }: { arg: Record<string, unknown> }) => {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(arg),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const err = new Error(body?.message || "Request failed");
    // err.statusCode = res.status;
    throw err;
  }
  return res.json();
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PreviewData {
  shareLink: any;
  snippet: any;
  userUpvoted: boolean;
  userBookmarked: boolean;
  isFollowing: boolean;
  currentUserId?: string;
}

export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  clerkId: string;
  plan: string;
  createdAt: string;
  isFollowing: boolean;
  isOwnProfile: boolean;
  _count: {
    followers: number;
    following: number;
    snippets: number;
  };
}

export interface FollowUser {
  id: string;
  name: string | null;
  clerkId: string;
  plan: string;
  followedAt: string;
  isFollowing: boolean;
  isOwnProfile: boolean;
  _count: { followers: number };
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function usePreviewSnippet(slug: string, passcode?: string) {
  const key = slug
    ? `/api/share-links/${slug}/preview${passcode ? `?passcode=${encodeURIComponent(passcode)}` : ""}`
    : null;

  const { data, error, isLoading, mutate } = useSWR<PreviewData>(key, fetcher, {
    refreshInterval: 30_000,
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 5_000,
  });

  return { data, isLoading, error, mutate };
}

/** Fetch a user's public profile (counts + isFollowing). */
export function useUserProfile(userId: string | null | undefined) {
  const { data, error, isLoading, mutate } = useSWR<UserProfile>(userId ? `/api/users/${userId}` : null, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 10_000,
  });
  return { profile: data, isLoading, error, mutate };
}

/** Paginated followers list. */
export function useFollowers(userId: string | null | undefined, cursor?: string) {
  const key = userId ? `/api/users/${userId}/followers${cursor ? `?cursor=${cursor}` : ""}` : null;
  const { data, error, isLoading } = useSWR<{ users: FollowUser[]; nextCursor: string | null }>(key, fetcher, {
    revalidateOnFocus: false,
  });
  return { data, isLoading, error };
}

/** Paginated following list. */
export function useFollowing(userId: string | null | undefined, cursor?: string) {
  const key = userId ? `/api/users/${userId}/following${cursor ? `?cursor=${cursor}` : ""}` : null;
  const { data, error, isLoading } = useSWR<{ users: FollowUser[]; nextCursor: string | null }>(key, fetcher, {
    revalidateOnFocus: false,
  });
  return { data, isLoading, error };
}

export function usePublishSnippet() {
  const { trigger, isMutating, error } = useSWRMutation("/api/publish", poster);
  return { publish: trigger, isPublishing: isMutating, error };
}

export function useSnippetMutation(snippetId: string) {
  const { trigger: toggleUpvote } = useSWRMutation(snippetId ? `/api/snippets/${snippetId}/upvote` : null, () =>
    toggler(`/api/snippets/${snippetId}/upvote`),
  );
  const { trigger: toggleBookmark } = useSWRMutation(snippetId ? `/api/snippets/${snippetId}/bookmark` : null, () =>
    toggler(`/api/snippets/${snippetId}/bookmark`),
  );
  const { trigger: createComment } = useSWRMutation(snippetId ? `/api/snippets/${snippetId}/comments` : null, poster);

  return { toggleUpvote, toggleBookmark, createComment };
}

export function useUserMutation(userId: string) {
  const { trigger: toggleFollow, isMutating: isFollowPending } = useSWRMutation(
    userId ? `/api/users/${userId}/follow` : null,
    () => toggler(`/api/users/${userId}/follow`),
  );
  return { toggleFollow, isFollowPending };
}
