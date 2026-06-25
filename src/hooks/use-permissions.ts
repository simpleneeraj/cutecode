"use client";

import { useUser } from "@/hooks/use-auth";
import { Plan, Role } from "@/generated/prisma/enums";
import { hasPermission, Permission } from "@/lib/rbac/permissions";

/**
 * Client-side permissions hook.
 *
 * NOTE: For UI only. Server-side permission checks are always mandatory.
 * Plan and role are read from Supabase app_metadata (surfaced via useUser()).
 */
export function usePermissions() {
  const { user, isLoaded } = useUser();

  const plan = (user?.publicMetadata?.plan as Plan) ?? Plan.FREE;
  const role = (user?.publicMetadata?.role as Role) ?? Role.USER;

  const can = (permission: Permission): boolean => {
    if (!isLoaded || !user) return false;
    return hasPermission(plan, role, permission);
  };

  return { can, plan, role, isLoaded };
}
