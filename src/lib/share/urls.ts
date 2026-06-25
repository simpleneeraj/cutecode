/**
 * Pure, client-safe share URL helpers (no DB imports).
 * Set NEXT_PUBLIC_BASE_URL to point share links at a custom/short domain.
 */
function baseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_BASE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  return "http://localhost:3000";
}

/** Canonical public URL for a published snippet/presentation share link. */
export function getShareUrl(slug: string): string {
  return `${baseUrl()}/preview/${slug}`;
}

/** Embeddable URL for a share link. */
export function getEmbedUrl(slug: string): string {
  return `${baseUrl()}/embed/${slug}`;
}
