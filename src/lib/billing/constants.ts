/**
 * Shared billing constants.
 * Kept in a separate file to avoid circular imports between service.ts and dunning.ts.
 */

/** Days after currentPeriodEnd before access is hard-revoked. */
export const GRACE_PERIOD_DAYS = 7;

/**
 * Maximum new snippet publishes per day for free-plan users.
 * Pro+ users have unlimited publishes. Updating an existing snippet does not count.
 * Change this single value to adjust the limit across the entire app.
 */
export const FREE_DAILY_PUBLISH_LIMIT = 10;
