import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth/index";
import { StatCards } from "./components/stat-cards";
import { SnippetsTable, type DashboardSnippet } from "./components/snippets-table";
import { AccountCard } from "./components/account-card";
import { DashboardEmptyState } from "./components/empty-state";

// Always render fresh — analytics should reflect the latest data.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireAuth();
  const userId = user.id;

  const [followers, snippets] = await Promise.all([
    prisma.userFollows.count({ where: { followingId: userId } }),
    prisma.snippet.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        isPublic: true,
        createdAt: true,
        shareLinks: {
          select: { slug: true, viewCount: true, visibility: true },
          orderBy: { createdAt: "asc" },
        },
        _count: { select: { comments: true, upvotes: true, bookmarks: true } },
      },
    }),
  ]);

  const rows: DashboardSnippet[] = snippets.map((s) => {
    const views = s.shareLinks.reduce((sum, l) => sum + l.viewCount, 0);
    const primary = s.shareLinks[0];
    return {
      id: s.id,
      title: s.title,
      isPublic: s.isPublic,
      createdAt: s.createdAt.toISOString(),
      views,
      upvotes: s._count.upvotes,
      comments: s._count.comments,
      bookmarks: s._count.bookmarks,
      slug: primary?.slug ?? null,
      visibility: primary?.visibility ?? null,
    };
  });

  const totals = {
    views: rows.reduce((sum, r) => sum + r.views, 0),
    published: rows.filter((r) => r.isPublic).length,
    upvotes: rows.reduce((sum, r) => sum + r.upvotes, 0),
    followers,
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-10">
      <div className="mb-8 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back{user.name ? `, ${user.name}` : ""}. Here is how your snippets are performing.
        </p>
      </div>

      <StatCards totals={totals} totalSnippets={rows.length} />

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {rows.length === 0 ? <DashboardEmptyState /> : <SnippetsTable snippets={rows} />}
        </div>
        <AccountCard
          plan={user.plan}
          renewsAt={user.subscription?.currentPeriodEnd?.toISOString() ?? null}
          cancelAtPeriodEnd={user.subscription?.cancelAtPeriodEnd ?? false}
          totalSnippets={rows.length}
        />
      </div>
    </div>
  );
}
