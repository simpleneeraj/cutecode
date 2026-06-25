import { prisma } from "@/lib/db";
import { cacheDel } from "@/lib/redis";

/**
 * Sync a Supabase user into the database.
 * Safe to call multiple times (upsert).
 */
export async function syncSupabaseUser(params: { supabaseId: string; email: string; name?: string }) {
  const result = await prisma.user.upsert({
    where: { supabaseId: params.supabaseId },
    create: {
      supabaseId: params.supabaseId,
      email: params.email,
      name: params.name ?? null,
    },
    update: {
      email: params.email,
      name: params.name ?? null,
    },
  });
  await cacheDel(`user-ctx:${params.supabaseId}`);
  return result;
}

/**
 * Ensure a DB user row exists for the given Supabase auth user.
 * Lazily creates it on first authenticated access (no auth webhook needed).
 * No-op when the row already exists.
 */
export async function ensureDbUser(authUser: {
  id: string;
  email?: string | null;
  user_metadata?: { full_name?: string; name?: string } | null;
}) {
  const existing = await prisma.user.findUnique({
    where: { supabaseId: authUser.id },
    select: { id: true },
  });
  if (existing) return;

  await syncSupabaseUser({
    supabaseId: authUser.id,
    email: authUser.email ?? `${authUser.id}@placeholder.local`,
    name: authUser.user_metadata?.full_name ?? authUser.user_metadata?.name ?? undefined,
  });
}

/**
 * Delete the DB user when a Supabase user is deleted.
 * Subscription and snippets are cascade-deleted by Prisma.
 */
export async function deleteSupabaseUser(supabaseId: string) {
  const result = await prisma.user.delete({ where: { supabaseId } }).catch((error) => {
    console.error(`Failed to delete user ${supabaseId} from DB:`, error);
  });
  await cacheDel(`user-ctx:${supabaseId}`);
  return result;
}
