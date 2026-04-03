import { getCurrentUser } from "@/lib/auth";
import { hasPermission, Permission } from "./permissions";

export { hasPermission } from "./permissions";
export type { Permission } from "./permissions";

/**
 * Check if the currently authenticated user has a permission.
 * Returns false (not throws) — safe for server component use.
 */
export async function checkPermission(permission: Permission): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  return hasPermission(user.plan, user.role, permission);
}

/**
 * Require a permission — throws if the user doesn't have it.
 * Use inside Server Actions and API routes.
 */
export async function requirePermission(permission: Permission): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthenticated");

  const allowed = hasPermission(user.plan, user.role, permission);
  if (!allowed) {
    throw new Error(
      `Forbidden: your current plan does not include "${permission}". Please upgrade.`
    );
  }
}
