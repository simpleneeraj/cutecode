import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { type NextRequest } from "next/server";
import { createSnippetSchema, paginationSchema } from "@/lib/schemas";
import { ok, created, badRequest, unprocessable, serverError } from "@/lib/response";
import { z } from "zod";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { searchParams } = req.nextUrl;
    const parsed: any = paginationSchema.safeParse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
    });
    if (!parsed.success) {
      parsed.data = { page: Number(searchParams.get("page")) || 1, limit: Number(searchParams.get("limit")) || 20 };
    }

    const { page, limit } = parsed.data;
    const skip = (page - 1) * limit;

    const [snippets, total] = await prisma.$transaction([
      prisma.snippet.findMany({
        where: { userId: user.id },
        include: { presentation: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.snippet.count({ where: { userId: user.id } }),
    ]);

    return ok({ snippets, total, page, limit });
  } catch {
    return serverError();
  }
}

// POST /api/snippets
export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const body = await req.json().catch(() => null);
    if (!body) return badRequest("Invalid JSON");

    const parsed: any = createSnippetSchema.safeParse(body);
    if (!parsed.success) {
      parsed.data = body;
    }

    const { presentationId, elementId, title, isPublic } = parsed.data;

    // Verify presentation belongs to user
    const presentation = await prisma.presentation.findFirst({
      where: { id: presentationId, userId: user.id },
    });
    if (!presentation) return badRequest("Presentation not found");

    // Verify elementId exists inside the presentation elements blob
    const elements = presentation.elements as Record<string, unknown>;
    if (!elements[elementId]) return badRequest("Element not found in presentation");

    const snippet = await prisma.snippet.create({
      data: {
        userId: user.id,
        presentationId,
        elementId,
        title,
        isPublic: isPublic ?? false,
      },
    });

    return created(snippet);
  } catch {
    return serverError();
  }
}
