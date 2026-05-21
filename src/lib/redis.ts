import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { FREE_DAILY_PUBLISH_LIMIT } from "@/lib/billing/constants";

const url = process.env.UPSTASH_REDIS_REST_URL || "";
const token = process.env.UPSTASH_REDIS_REST_TOKEN || "";

export const isRedisConfigured = !!url && !!token;

export const redis = new Redis({ url, token });

/**
 * Publish abuse guard: 10 per minute per user (strict, all users)
 */
export const publishRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
  prefix: "ratelimit:publish",
});

/**
 * Daily publish quota for free-plan users: FREE_DAILY_PUBLISH_LIMIT new snippets per 24 hours.
 * Only checked for new publishes — updating an existing snippet does not consume this limit.
 * Pro+ users bypass this limiter entirely.
 */
export const publishDailyRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(FREE_DAILY_PUBLISH_LIMIT, "24 h"),
  analytics: true,
  prefix: "ratelimit:publish:daily",
});

/**
 * Social actions (upvote/bookmark/follow): 30 per minute per user
 */
export const socialRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 m"),
  analytics: true,
  prefix: "ratelimit:social",
});

/**
 * General read API: 120 per minute per IP
 */
export const apiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(120, "1 m"),
  analytics: true,
  prefix: "ratelimit:api",
});

/**
 * Comments: 20 per minute per user
 */
export const commentRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1 m"),
  analytics: true,
  prefix: "ratelimit:comment",
});

/**
 * Safely check rate limit. Fails open if Redis is down (never blocks users on infra issues).
 */
export async function checkRateLimit(
  ratelimiter: Ratelimit,
  identifier: string,
): Promise<{ success: boolean; limit?: number; remaining?: number; reset?: number }> {
  if (!isRedisConfigured) return { success: true };

  try {
    return await ratelimiter.limit(identifier);
  } catch {
    /**
     * Fail open — Redis outage should never cause user-facing errors
     */
    return { success: true };
  }
}

/**
 * Cache a value in Redis with an expiry (seconds).
 */
export async function cacheSet(key: string, value: unknown, ttlSeconds: number) {
  if (!isRedisConfigured) return;
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
  } catch {
    /**
     * Non-fatal
     */
  }
}

/**
 * Get a cached value from Redis.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!isRedisConfigured) return null;
  try {
    const raw = await redis.get(key);
    if (!raw) return null;
    return (typeof raw === "string" ? JSON.parse(raw) : raw) as T;
  } catch {
    return null;
  }
}

/**
 * Invalidate a cache key.
 */
export async function cacheDel(key: string) {
  if (!isRedisConfigured) return;
  try {
    await redis.del(key);
  } catch {
    /**
     * Non-fatal
     */
  }
}
