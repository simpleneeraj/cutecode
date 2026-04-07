/**
 * Safely appends a query parameter to the current window URL.
 * Falls back to a default route if `window` is undefined (e.g. during SSR).
 */
export function getRedirectUrlWithParam(key: string, value: string, fallbackUrl = "/"): string {
  if (typeof window === "undefined") return fallbackUrl;
  const url = new URL(window.location.href);
  url.searchParams.set(key, value);
  return url.toString();
}

/**
 * Cleanly removes a key from URLSearchParams, 
 * useful for jotai-location state updates.
 */
export function removeSearchParam(searchParams: URLSearchParams | null | undefined, key: string): URLSearchParams {
  const next = new URLSearchParams(searchParams?.toString() ?? "");
  next.delete(key);
  return next;
}

/**
 * Safely checks if a search parameter equals a certain value.
 */
export function hasSearchParam(searchParams: URLSearchParams | null | undefined, key: string, value: string): boolean {
  if (!searchParams) return false;
  const params = new URLSearchParams(searchParams.toString());
  return params.get(key) === value;
}

