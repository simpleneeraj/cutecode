/**
 * server/types.ts
 *
 * Re-exports ONLY the AppRouter type — safe to import from client bundles.
 * This keeps `server/trpc.ts` as a pure server-only module while still
 * giving the vanilla tRPC client full type inference.
 *
 * Usage in client files:
 *   import type { AppRouter } from "@/server/types";
 */

import type { AppRouter } from "./trpc";

export type { AppRouter };
