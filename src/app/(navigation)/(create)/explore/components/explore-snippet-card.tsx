"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowBigUpDash, BookmarkIcon, UserIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/cn";
import { EASE_OUT } from "@/lib/motion";

export type ExploreSnippet = {
  id: string;
  title: string | null;
  description: string | null;
  tags: string[];
  createdAt: Date | string;
  elementId: string;
  user: { id: string; name: string | null; clerkId: string } | null;
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
      <Link href={`/preview/${slug}`}>
        <Card className={cn("group cursor-pointer overflow-hidden h-full flex flex-col")}>
          {/* Gradient placeholder for the code image */}
          <div
            className="h-36 w-full relative overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, hsl(var(--gray-3)) 0%, hsl(var(--gray-2)) 40%, hsl(var(--brand-subtle)) 100%)",
            }}
          >
            <div className="absolute inset-0 flex items-end p-3">
              <div className="flex gap-1 flex-wrap">
                {snippet.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-background/60 backdrop-blur-sm text-muted-foreground font-mono"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <CardHeader className="p-4 gap-1 flex-1">
            <CardTitle className="text-sm font-semibold truncate leading-tight">
              {snippet.title || snippet.presentation.name || "Untitled Snippet"}
            </CardTitle>
            {snippet.description && (
              <CardDescription className="text-xs line-clamp-2 mt-0.5">{snippet.description}</CardDescription>
            )}
          </CardHeader>

          <CardFooter className="px-4 py-3 border-t flex items-center justify-between gap-2">
            {/* Author */}
            <Link
              href={snippet.user?.id ? `/u/${snippet.user.id}` : "#"}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 min-w-0 hover:opacity-80 transition-opacity"
            >
              <div className="flex size-5 items-center justify-center rounded-full bg-brand/20 text-brand text-[10px] font-bold shrink-0">
                {authorInitial}
              </div>
              <span className="text-xs text-muted-foreground truncate">{authorName}</span>
            </Link>

            {/* Stats */}
            <div className="flex items-center gap-2.5 text-xs text-muted-foreground shrink-0">
              <span className="flex items-center gap-1">
                <ArrowBigUpDash className="size-3.5" />
                {snippet._count.upvotes}
              </span>
              <span className="flex items-center gap-1">
                <BookmarkIcon className="size-3.5" />
                {snippet._count.bookmarks}
              </span>
            </div>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}
