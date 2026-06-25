import { Plan, Role } from "@/generated/prisma/enums";

/**
 * Every feature maps to either:
 * - a minimum Plan (plan-based access)
 * - null (admin-only, role-based)
 */
export const PERMISSIONS = {
  // Exports
  "export:basic": Plan.FREE,
  "export:hd": Plan.PRO,
  "export:4k": Plan.PREMIUM,
  // Themes
  "theme:premium": Plan.PRO,
  // Watermark
  "watermark:remove": Plan.PRO,
  // Snippets
  "snippet:save": Plan.FREE,
  // API
  "api:access": Plan.PREMIUM,
  // Admin (role-based, not plan-based)
  "admin:panel": null,
} as const satisfies Record<string, Plan | null>;

export type Permission = keyof typeof PERMISSIONS;

const PLAN_ORDER: Record<Plan, number> = {
  [Plan.FREE]: 0,
  [Plan.PRO]: 1,
  [Plan.PREMIUM]: 2,
};

/**
 * Pure function — determine if a user with the given plan + role can use a feature.
 * No DB calls. Safe for any context including client-side hooks.
 */
export function hasPermission(plan: Plan, role: Role, permission: Permission): boolean {
  const requiredPlan = PERMISSIONS[permission];

  // Admin-only permissions are role-based, not plan-based
  if (requiredPlan === null) {
    return role === Role.ADMIN;
  }

  return PLAN_ORDER[plan] >= PLAN_ORDER[requiredPlan];
}
