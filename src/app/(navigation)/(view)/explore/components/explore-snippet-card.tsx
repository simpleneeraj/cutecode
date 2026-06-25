"use client";

import { Link } from "@/components/link";
import { motion } from "motion/react";
import { Like, Bookmark } from "@solar-icons/react";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { cn } from "@/utils/cn";
import { EASE_OUT } from "@/lib/motion";
import { SnippetPreview } from "../../../components/snippet-preview";

export type ExploreSnippet = {
  id: string;
  title: string | null;
  description: string | null;
  tags: string[];
  createdAt: Date | string;
  elementId: string;
  user: { id: string; name: string | null } | null;
  presentation: { id: string; name: string };
  shareLinks: { slug: string }[];
  _count: { upvotes: number; bookmarks: number; comments: number };
};

type ExploreSnippetCardProps = {
  snippet: ExploreSnippet;
  index: number;
};

export function ExploreSnippetCard({ snippet, index }: ExploreSnippetCardProps) {
  const slug = snippet.shareLinks[0]?.slug;
  const authorName = snippet.user?.name || "Anonymous";
  const authorInitial = authorName.charAt(0).toUpperCase();

  if (!slug) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.28, delay: Math.min(index * 0.04, 0.4), ease: EASE_OUT }}
      whileHover={{ y: -3, transition: { duration: 0.18, ease: EASE_OUT } }}
    >
      <Card className="group relative flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md">
        {/* Card-level link as an overlay so the nested author link stays valid HTML */}
        <Link
          href={`/preview/${slug}`}
          aria-label={snippet.title || snippet.presentation.name || "Open snippet"}
          className="absolute inset-0 z-0"
        />

        <SnippetPreview language={snippet.presentation.name} />

        <CardHeader className="flex-1 gap-1 p-4">
          <CardTitle className="truncate text-sm leading-tight">
            {snippet.title || snippet.presentation.name || "Untitled Snippet"}
          </CardTitle>
          {snippet.description && (
            <CardDescription className="mt-0.5 line-clamp-2 text-xs">{snippet.description}</CardDescription>
          )}
        </CardHeader>

        <CardFooter className="flex items-center justify-between gap-2 border-t px-4 py-3">
          {/* Author — real link, lifted above the card overlay */}
          <Link
            href={snippet.user?.id ? `/u/${snippet.user.id}` : "#"}
            onClick={(e) => e.stopPropagation()}
            className={cn("relative z-10 flex min-w-0 items-center gap-1.5 transition-opacity hover:opacity-80")}
          >
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
              {authorInitial}
            </span>
            <span className="truncate text-xs text-muted-foreground">{authorName}</span>
          </Link>

          <div className="relative z-10 flex shrink-0 items-center gap-2.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Like weight="BoldDuotone" className="size-3.5" aria-hidden="true" />
              {snippet._count.upvotes}
            </span>
            <span className="flex items-center gap-1">
              <Bookmark weight="BoldDuotone" className="size-3.5" aria-hidden="true" />
              {snippet._count.bookmarks}
            </span>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
