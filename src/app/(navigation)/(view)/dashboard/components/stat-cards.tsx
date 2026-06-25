import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";

type Totals = {
  views: number;
  published: number;
  upvotes: number;
  followers: number;
};

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

export function StatCards({ totals, totalSnippets }: { totals: Totals; totalSnippets: number }) {
  const stats = [
    { label: "Total views", value: totals.views, icon: "solar:eye-bold", sub: "across all share links" },
    { label: "Snippets published", value: totals.published, icon: "solar:code-square-bold", sub: `${totalSnippets} total` },
    { label: "Total upvotes", value: totals.upvotes, icon: "solar:like-bold", sub: "from the community" },
    { label: "Followers", value: totals.followers, icon: "solar:users-group-rounded-bold", sub: "creators following you" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s) => (
        <Card key={s.label} className="flex flex-col gap-3 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{s.label}</span>
            <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Icon icon={s.icon} className="size-4" />
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-3xl font-semibold tracking-tight text-foreground tabular-nums">
              {formatCount(s.value)}
            </span>
            <span className="text-xs text-muted-foreground">{s.sub}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}
