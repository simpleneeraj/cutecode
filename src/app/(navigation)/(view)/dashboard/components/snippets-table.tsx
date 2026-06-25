import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getShareUrl } from "@/lib/share/urls";
import { CopyLinkButton } from "./copy-link-button";

export type DashboardSnippet = {
  id: string;
  title: string | null;
  isPublic: boolean;
  createdAt: string;
  views: number;
  upvotes: number;
  comments: number;
  bookmarks: number;
  slug: string | null;
  visibility: string | null;
};

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(iso));
}

export function SnippetsTable({ snippets }: { snippets: DashboardSnippet[] }) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between gap-2 border-b px-5 py-4">
        <div className="flex flex-col">
          <h2 className="text-sm font-semibold text-foreground">Your snippets</h2>
          <p className="text-xs text-muted-foreground">{snippets.length} total, newest first</p>
        </div>
        <Button variant="outline" size="sm" render={<Link href="/snippets" />}>
          View all
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead className="text-right">Upvotes</TableHead>
              <TableHead className="text-right">Comments</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead className="text-right">Created</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {snippets.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="max-w-[220px]">
                  {s.slug ? (
                    <Link
                      href={getShareUrl(s.slug)}
                      target="_blank"
                      className="block truncate font-medium text-foreground hover:underline"
                    >
                      {s.title || "Untitled snippet"}
                    </Link>
                  ) : (
                    <span className="block truncate font-medium text-foreground">{s.title || "Untitled snippet"}</span>
                  )}
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">{s.views}</TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">{s.upvotes}</TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">{s.comments}</TableCell>
                <TableCell>
                  <Badge variant={s.isPublic ? "secondary" : "outline"} className="gap-1">
                    <Icon
                      icon={s.isPublic ? "solar:global-linear" : "solar:lock-keyhole-minimalistic-linear"}
                      className="size-3"
                    />
                    {s.isPublic ? "Public" : "Private"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right whitespace-nowrap text-xs text-muted-foreground">
                  {formatDate(s.createdAt)}
                </TableCell>
                <TableCell>{s.slug ? <CopyLinkButton slug={s.slug} /> : null}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
