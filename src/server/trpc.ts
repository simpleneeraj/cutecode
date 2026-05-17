/**
 * server/trpc.ts
 *
 * Root router assembly.
 * All procedures/context/shared inputs live in server/init.ts.
 * Sub-routers import from server/init.ts to avoid circular dependencies.
 *
 * Exports:
 *   - `appRouter`  — the root router (all sub-routers registered here)
 *   - `AppRouter`  — the inferred type (re-exported via server/types.ts for client use)
 *
 * Also re-exports everything from init.ts for the API route handler.
 */

import "server-only";

export { router, publicProcedure, protectedProcedure, paginationInput, createContext } from "./init";
export type { Context } from "./init";

import { router } from "./init";
import { snippetRouter } from "./routers/snippet";
import { presentationRouter } from "./routers/presentation";
import { shareRouter } from "./routers/share";
import { userRouter } from "./routers/user";
import { publishRouter } from "./routers/publish";

export const appRouter = router({
  snippet: snippetRouter,
  presentation: presentationRouter,
  share: shareRouter,
  user: userRouter,
  publish: publishRouter,
});

/**
 * Root router type (re-exported for client use)
 */
export type AppRouter = typeof appRouter;
