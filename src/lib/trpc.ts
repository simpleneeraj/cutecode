/**
 * lib/trpc.ts
 *
 * Vanilla tRPC client (no React Query / @trpc/react-query).
 * Import `trpc` in custom hooks to call procedures.
 *
 * Usage:
 *   import { trpc } from "@/lib/trpc";
 *   const data = await trpc.snippet.list.query({ page: 1, limit: 20 });
 */

import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@/server/types";


function getBaseUrl() {
  if (typeof window !== "undefined") return ""; // browser — relative URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
    }),
  ],
});
