/**
 * Shared billing constants.
 * Kept in a separate file to avoid circular imports between service.ts and dunning.ts.
 */

/** Days after currentPeriodEnd before access is hard-revoked. */
export const GRACE_PERIOD_DAYS = 7;

/**
 * Dunning retry schedule: days after the first payment failure.
 * Index 0 = attempt 1, index 1 = attempt 2, etc.
 * Must align with DunningService.EMAIL_TYPES array order.
 */
export const DUNNING_SCHEDULE_DAYS = [1, 5, 13] as const;
