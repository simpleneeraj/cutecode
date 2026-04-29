import { type NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound, ok, serverError } from "@/lib/response";

type Params = { params: Promise<{ id: string }> };

// GET /api/share-links/[id]/analytics
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { id } = await params;

    const link = await prisma.shareLink.findFirst({
      where: { id, userId: user.id },
      select: {
        id:        true,
        slug:      true,
        viewCount: true,
        maxViews:  true,
        expiresAt: true,
        views: {
          orderBy: { viewedAt: "desc" },
          take:    100,
          select: {
            id:           true,
            passcodeUsed: true,
            referer:      true,
            viewedAt:     true,
            // Never return ipHash or userAgent to the owner UI
          },
        },
      },
    });

    if (!link) return notFound("Share link not found");

    // Aggregate by day for sparkline
    const byDay = link.views.reduce<Record<string, number>>((acc, v) => {
      const day = v.viewedAt.toISOString().slice(0, 10);
      acc[day] = (acc[day] ?? 0) + 1;
      return acc;
    }, {});

    return ok({
      id:           link.id,
      slug:         link.slug,
      totalViews:   link.viewCount,
      maxViews:     link.maxViews,
      expiresAt:    link.expiresAt,
      recentViews:  link.views,
      viewsByDay:   byDay,
    });
  } catch {
    return serverError();
  }
}
