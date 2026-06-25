"use client";

import { Link } from "@/components/link";
import { motion } from "motion/react";
import { Like, Bookmark, Calendar, Global, EyeClosed, LockPassword, LockKeyholeMinimalistic } from "@solar-icons/react";
import { ShareVisibility } from "@/generated/prisma/enums";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { cn } from "@/utils/cn";
import { SnippetPreview } from "../../../components/snippet-preview";

function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(date));
}

function VisibilityIcon({ visibility }: { visibility: string }) {
  const className = "size-3.5 text-muted-foreground";
  switch (visibility) {
    case ShareVisibility.PUBLIC:
      return <Global weight="LineDuotone" className={className} aria-hidden="true" />;
    case ShareVisibility.UNLISTED:
      return <EyeClosed weight="LineDuotone" className={className} aria-hidden="true" />;
    case ShareVisibility.PASSCODE:
      return <LockPassword weight="LineDuotone" className={className} aria-hidden="true" />;
    default:
      return <LockKeyholeMinimalistic weight="LineDuotone" className={className} aria-hidden="true" />;
  }
}

function visibilityLabel(v: string) {
  switch (v) {
    case ShareVisibility.PUBLIC:
      return "Public";
    case ShareVisibility.UNLISTED:
      return "Unlisted";
    case ShareVisibility.PASSCODE:
      return "Protected";
    default:
      return "Private";
  }
}

export type Snippet = {
  id: string;
  title: string | null;
  tags: string[];
  isPublic: boolean;
  createdAt: Date | string;
  elementId: string;
  presentation: { id: string; name: string };
  shareLinks: { slug: string; visibility: string }[];
  _count: { upvotes: number; bookmarks: number };
};

export function SnippetCard({ snippet, index }: { snippet: Snippet; index: number }) {
  const slug = snippet.shareLinks[0]?.slug;
  const visibility =
    snippet.shareLinks[0]?.visibility ?? (snippet.isPublic ? ShareVisibility.PUBLIC : ShareVisibility.PRIVATE);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.4) }}
    >
      <Card className="group relative flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md">
        {/* Card-level link as an overlay so any nested links stay valid HTML */}
        <Link
          href={`/preview/${slug}`}
          aria-label={snippet.title || snippet.presentation.name || "Open snippet"}
          className="absolute inset-0 z-0"
        />

        <div className="relative">
          <SnippetPreview language={snippet.presentation.name} />
          <div className="absolute right-2.5 top-2.5">
            <span className="flex size-7 items-center justify-center rounded-lg border bg-background/80 backdrop-blur-sm">
              <VisibilityIcon visibility={visibility} />
            </span>
          </div>
        </div>

        <CardHeader className="flex-1 gap-2 p-4">
          <div>
            <CardTitle className="truncate text-sm">
              {snippet.title || snippet.presentation.name || "Untitled Snippet"}
            </CardTitle>
            <CardDescription className="mt-0.5 truncate text-xs">{snippet.presentation.name}</CardDescription>
          </div>

          <div className="flex flex-wrap gap-1">
            <Badge variant="outline" size="sm">
              {visibilityLabel(visibility)}
            </Badge>
            {snippet.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" size="sm">
                {tag}
              </Badge>
            ))}
            {snippet.tags.length > 2 && (
              <Badge variant="secondary" size="sm">
                +{snippet.tags.length - 2}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardFooter className="flex items-center justify-between gap-2 border-t px-4 py-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Like weight="BoldDuotone" className="size-3.5" aria-hidden="true" />
              {snippet._count.upvotes}
            </span>
            <span className="flex items-center gap-1">
              <Bookmark weight="BoldDuotone" className="size-3.5" aria-hidden="true" />
              {snippet._count.bookmarks}
            </span>
          </div>
          <span className="flex items-center gap-1 text-muted-foreground/70">
            <Calendar weight="LineDuotone" className="size-3.5" aria-hidden="true" />
            {formatDate(snippet.createdAt)}
          </span>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
