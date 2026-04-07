import { z } from "zod";
import { NextResponse } from "next/server";

/**
 * Parse and validate request body with a Zod schema.
 * Returns a 400 response on validation failure.
 */
export async function parseBody<T>(
  req: Request,
  schema: z.ZodSchema<T>,
): Promise<{ data: T; error: null } | { data: null; error: NextResponse }> {
  try {
    const json = await req.json();
    const data = schema.parse(json);
    return { data, error: null };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return {
        data: null,
        error: NextResponse.json({ error: "Invalid request body", details: z.treeifyError(err) }, { status: 400 }),
      };
    }
    return {
      data: null,
      error: NextResponse.json({ error: "Bad request" }, { status: 400 }),
    };
  }
}

/**
 * Wrap an API route handler with standard error handling.
 */
export function withErrorHandler(handler: (req: Request) => Promise<NextResponse>) {
  return async (req: Request): Promise<NextResponse> => {
    try {
      return await handler(req);
    } catch (err) {
      if (err instanceof Error && err.message.startsWith("Forbidden")) {
        return NextResponse.json({ error: err.message }, { status: 403 });
      }
      if (err instanceof Error && err.message === "Unauthenticated") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      console.error("[API Error]", err);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  };
}
