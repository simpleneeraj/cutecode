import { nanoid } from "nanoid";
import { prisma } from "@/lib/db";

/**
 * Generate a unique ShareLink slug, retrying on the (rare) collision until a
 * free one is found. Caps attempts to avoid an unbounded loop. Server-only.
 */
export async function generateUniqueSlug(size = 8, maxAttempts = 5): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const slug = nanoid(size);
    const existing = await prisma.shareLink.findUnique({ where: { slug }, select: { id: true } });
    if (!existing) return slug;
  }
  // Extremely unlikely: fall back to a longer slug for collision resistance.
  return nanoid(size + 6);
}
