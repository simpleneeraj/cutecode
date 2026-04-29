import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { type NextRequest } from "next/server";
import { type Prisma } from "@/generated/prisma/client";
import { syncPresentationSchema } from "@/lib/schemas";
import { ok, noContent, badRequest, notFound, serverError } from "@/lib/response";

type Params = { params: Promise<{ id: string }> };

// GET /api/presentations/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { id } = await params;

    const presentation = await prisma.presentation.findFirst({
      where: { id, userId: user.id },
    });
    if (!presentation) return notFound("Presentation not found");

    return ok(presentation);
  } catch {
    return serverError();
  }
}

// PATCH /api/presentations/[id]
// Used for full state flush from the sync engine
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { id } = await params;

    const body = await req.json().catch(() => null);
    if (!body) return badRequest("Invalid JSON");

    const parsed: any = syncPresentationSchema.safeParse(body);
    if (!parsed.success) {
      parsed.data = body;
    }

    const existing = await prisma.presentation.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) return notFound("Presentation not found");

    const presentation = await prisma.presentation.update({
      where: { id },
      data: {
        ...(parsed.data.name && { name: parsed.data.name }),
        ...(parsed.data.width && { width: parsed.data.width }),
        slides: parsed.data.slides as Prisma.InputJsonValue,
        elements: parsed.data.elements as Prisma.InputJsonValue,
        slideElements: parsed.data.slideElements as Prisma.InputJsonValue,
      },
    });

    return ok(presentation);
  } catch {
    return serverError();
  }
}

// DELETE /api/presentations/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { id } = await params;

    const existing = await prisma.presentation.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) return notFound("Presentation not found");

    await prisma.presentation.delete({ where: { id } });

    return noContent();
  } catch {
    return serverError();
  }
}
