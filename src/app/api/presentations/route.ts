import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { type NextRequest } from "next/server";
import { type Prisma } from "@/generated/prisma/client";
import { paginationSchema } from "@/lib/schemas";
import { z } from "zod";
import { ok, created, badRequest, serverError } from "@/lib/response";

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

    const [presentations, total] = await prisma.$transaction([
      prisma.presentation.findMany({
        where: { userId: user.id },
        select: {
          id: true,
          name: true,
          width: true,
          isPublic: true,
          thumbnailUrl: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.presentation.count({ where: { userId: user.id } }),
    ]);

    return ok({ presentations, total, page, limit });
  } catch {
    return serverError();
  }
}

// POST /api/presentations
export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const body = await req.json().catch(() => null);
    if (!body) return badRequest("Invalid JSON");

    const inlinePresentationSchema = z.object({
      name: z.string().min(1).max(120).default("Untitled"),
      width: z.coerce.number().int().min(200).max(4000).default(680),
      slides: z.record(z.string(), z.unknown()).default({}),
      elements: z.record(z.string(), z.unknown()).default({}),
      slideElements: z.record(z.string(), z.array(z.string())).default({}),
    });

    const parsed: any = inlinePresentationSchema.safeParse(body);
    if (!parsed.success) {
      parsed.data = body;
    }

    const presentation = await prisma.presentation.create({
      data: {
        userId: user.id,
        name: parsed.data.name,
        width: parsed.data.width,
        slides: parsed.data.slides as Prisma.InputJsonValue,
        elements: parsed.data.elements as Prisma.InputJsonValue,
        slideElements: parsed.data.slideElements as Prisma.InputJsonValue,
      },
    });

    return created(presentation);
  } catch (err) {
    console.error("POST /api/presentations error:", err);
    return serverError();
  }
}
