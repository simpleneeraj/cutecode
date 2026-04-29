import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { type NextRequest, NextResponse } from "next/server";
import { ok, created, badRequest, serverError } from "@/lib/response";
import { commentRateLimit, checkRateLimit } from "@/lib/redis";

type Params = { params: Promise<{ id: string }> };

const MAX_COMMENT_LENGTH = 2000;

// GET /api/snippets/[id]/comments — paginated comments with author info
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id: snippetId } = await params;
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const take = 20;

    const comments = await prisma.snippetComment.findMany({
      where: { snippetId },
      orderBy: { createdAt: "desc" },
      take,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      include: {
        user: { select: { id: true, name: true, clerkId: true } },
      },
    });

    const nextCursor = comments.length === take ? comments[comments.length - 1].id : null;

    return ok({ comments, nextCursor });
  } catch {
    return serverError();
  }
}

// POST /api/snippets/[id]/comments — add a comment (auth required)
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { success } = await checkRateLimit(commentRateLimit, `comment:${user.id}`);
    if (!success) {
      return NextResponse.json({ message: "Too many comments. Slow down." }, { status: 429 });
    }

    const { id: snippetId } = await params;

    const body = await req.json().catch(() => null);
    if (!body || typeof body.content !== "string" || !body.content.trim()) {
      return badRequest("content is required");
    }

    const content = body.content.trim();
    if (content.length > MAX_COMMENT_LENGTH) {
      return badRequest(`Comment too long (max ${MAX_COMMENT_LENGTH} chars)`);
    }

    const snippet = await prisma.snippet.findUnique({ where: { id: snippetId } });
    if (!snippet) return badRequest("Snippet not found");

    const comment = await prisma.snippetComment.create({
      data: { snippetId, userId: user.id, content },
      include: {
        user: { select: { id: true, name: true, clerkId: true } },
      },
    });

    return created(comment);
  } catch {
    return serverError();
  }
}
