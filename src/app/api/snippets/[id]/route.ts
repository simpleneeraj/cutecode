import { type NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateSnippetSchema } from "@/lib/schemas";
import {
  ok, noContent, badRequest, notFound, unprocessable, serverError,
} from "@/lib/response";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

// GET /api/snippets/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { id } = await params;

    const snippet = await prisma.snippet.findFirst({
      where:   { id, userId: user.id },
      include: { presentation: { select: { id: true, name: true, elements: true } } },
    });
    if (!snippet) return notFound("Snippet not found");

    // Resolve the element from the presentation blob
    const elements = snippet.presentation.elements as Record<string, unknown>;
    const element  = elements[snippet.elementId] ?? null;

    return ok({ ...snippet, element });
  } catch {
    return serverError();
  }
}

// PATCH /api/snippets/[id]
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { id } = await params;

    const body = await req.json().catch(() => null);
    if (!body) return badRequest("Invalid JSON");

    const parsed: any = updateSnippetSchema.safeParse(body);
    if (!parsed.success) {
      parsed.data = body;
    }

    const existing = await prisma.snippet.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) return notFound("Snippet not found");

    const snippet = await prisma.snippet.update({
      where: { id },
      data:  parsed.data,
    });

    return ok(snippet);
  } catch {
    return serverError();
  }
}

// DELETE /api/snippets/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { id } = await params;

    const existing = await prisma.snippet.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) return notFound("Snippet not found");

    await prisma.snippet.delete({ where: { id } });

    return noContent();
  } catch {
    return serverError();
  }
}
