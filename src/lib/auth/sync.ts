import { prisma } from "@/lib/db";
import { cacheDel } from "@/lib/redis";

/**
 * Sync a Clerk user into the database.
 * Called from the Clerk webhook handler.
 * Safe to call multiple times (upsert).
 */
export async function syncClerkUser(params: { clerkId: string; email: string; name?: string }) {
  const result = await prisma.user.upsert({
    where: { clerkId: params.clerkId },
    create: {
      clerkId: params.clerkId,
      email: params.email,
      name: params.name ?? null,
    },
    update: {
      email: params.email,
      name: params.name ?? null,
    },
  });
  await cacheDel(`user-ctx:${params.clerkId}`);
  return result;
}

/**
 * Delete the DB user when a Clerk user is deleted.
 * Subscription and snippets are cascade-deleted by Prisma.
 */
export async function deleteClerkUser(clerkId: string) {
  const result = await prisma.user.delete({ where: { clerkId } }).catch((error) => {
    console.error(`Failed to delete user ${clerkId} from DB:`, error);
  });
  await cacheDel(`user-ctx:${clerkId}`);
  return result;
}

/** Extract primary email from Clerk webhook data */
export function extractEmail(
  emailAddresses: Array<{ email_address: string; id: string }>,
  primaryEmailAddressId: string | null,
): string {
  if (primaryEmailAddressId) {
    const primary = emailAddresses.find((e) => e.id === primaryEmailAddressId);
    if (primary) return primary.email_address;
  }
  return emailAddresses[0]?.email_address ?? "";
}
