/**
 * Lightweight in-memory rate limiting + cache.
 *
 * Replaces the former Upstash Redis dependency — no external service required.
 * Suitable for self-hosting and single-instance/dev. NOTE: on serverless (many
 * isolated instances) limits and cache are per-instance and reset on cold start,
 * so this is best-effort, not globally shared. Swap in a shared store (Redis,
 * Vercel KV, etc.) behind this same API if you need cross-instance guarantees.
 */
import { FREE_DAILY_PUBLISH_LIMIT } from "@/lib/billing/constants";

export type RateLimiter = { points: number; windowMs: number; prefix: string };

function rl(points: number, windowMs: number, prefix: string): RateLimiter {
  return { points, windowMs, prefix };
}

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

/** Publish abuse guard: 10 per minute per user. */
export const publishRateLimit = rl(10, MINUTE, "publish");

/** Daily publish quota for free-plan users (Pro+ bypass this entirely). */
export const publishDailyRateLimit = rl(FREE_DAILY_PUBLISH_LIMIT, DAY, "publish:daily");

/** Social actions (upvote/bookmark/follow): 30 per minute per user. */
export const socialRateLimit = rl(30, MINUTE, "social");

/** General read API: 120 per minute per IP. */
export const apiRateLimit = rl(120, MINUTE, "api");

/** Comments: 20 per minute per user. */
export const commentRateLimit = rl(20, MINUTE, "comment");

// ── Sliding-window store ────────────────────────────────────────────────────

const hits = new Map<string, number[]>();
let lastSweep = Date.now();

/** Periodically drop empty buckets so the map can't grow unbounded. */
function maybeSweep(now: number) {
  if (now - lastSweep < 5 * MINUTE) return;
  lastSweep = now;
  for (const [key, times] of hits) {
    if (times.length === 0 || times[times.length - 1] < now - DAY) hits.delete(key);
  }
}

/**
 * Check (and consume) a rate-limit token. Fails open on any unexpected error —
 * limiting should never cause user-facing failures.
 */
export async function checkRateLimit(
  limiter: RateLimiter,
  identifier: string,
): Promise<{ success: boolean; limit?: number; remaining?: number; reset?: number }> {
  try {
    const key = `${limiter.prefix}:${identifier}`;
    const now = Date.now();
    maybeSweep(now);

    const windowStart = now - limiter.windowMs;
    const recent = (hits.get(key) ?? []).filter((t) => t > windowStart);

    if (recent.length >= limiter.points) {
      hits.set(key, recent);
      return { success: false, limit: limiter.points, remaining: 0, reset: recent[0] + limiter.windowMs };
    }

    recent.push(now);
    hits.set(key, recent);
    return {
      success: true,
      limit: limiter.points,
      remaining: limiter.points - recent.length,
      reset: now + limiter.windowMs,
    };
  } catch {
    return { success: true };
  }
}

// ── TTL cache ───────────────────────────────────────────────────────────────

const cache = new Map<string, { value: unknown; expiresAt: number }>();

/** Cache a value with an expiry (seconds). */
export async function cacheSet(key: string, value: unknown, ttlSeconds: number) {
  cache.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}

/** Get a cached value (null if missing or expired). */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.value as T;
}

/** Invalidate a cache key. */
export async function cacheDel(key: string) {
  cache.delete(key);
}
