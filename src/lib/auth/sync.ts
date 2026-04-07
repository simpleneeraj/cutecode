import { prisma } from "@/lib/db";

/**
 * Sync a Clerk user into the database.
 * Called from the Clerk webhook handler.
 * Safe to call multiple times (upsert).
 */
export async function syncClerkUser(params: { clerkId: string; email: string; name?: string }) {
  return prisma.user.upsert({
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
}

/**
 * Delete the DB user when a Clerk user is deleted.
 * Subscription and snippets are cascade-deleted by Prisma.
 */
export async function deleteClerkUser(clerkId: string) {
  return prisma.user.delete({ where: { clerkId } }).catch(() => {
    // Ignore if already deleted
  });
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
