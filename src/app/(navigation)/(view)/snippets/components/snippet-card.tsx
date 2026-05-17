"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Icon } from "@iconify/react";
import { ShareVisibility } from "@/generated/prisma/enums";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { cn } from "@/utils/cn";
import SnippetThumbnail from "./snippet-thumbnail";
import { ArrowBigUpDash, BookmarkIcon, CalendarIcon, EyeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function visibilityMeta(v: string) {
  switch (v) {
    case ShareVisibility.PUBLIC:
      return { label: "Public", icon: "solar:global-bold", color: "text-emerald-500", bg: "bg-emerald-500/10" };
    case ShareVisibility.UNLISTED:
      return { label: "Unlisted", icon: "solar:eye-closed-bold", color: "text-amber-500", bg: "bg-amber-500/10" };
    case ShareVisibility.PASSCODE:
      return { label: "Protected", icon: "solar:lock-password-bold", color: "text-sky-500", bg: "bg-sky-500/10" };
    default:
      return { label: "Private", icon: "solar:lock-bold", color: "text-muted-foreground", bg: "bg-muted" };
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
  const { label, icon, color, bg } = visibilityMeta(visibility);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
    >
      <Link href={`/preview/${slug}`}>
        <Card className={cn("group cursor-pointer overflow-hidden")}>
          <div className="relative overflow-hidden">
            <SnippetThumbnail />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button variant="outline" className="backdrop-blur-lg">
                <EyeIcon className="size-4" />
                View Snippet
              </Button>
            </div>
            {/* Language tag (top-right) */}
            <div className="absolute top-2.5 right-2.5">
              <div className={cn("flex size-7 items-center justify-center rounded-lg border border-white/15", bg)}>
                <Icon icon={icon} className={cn("size-3.5", color)} />
              </div>
            </div>
          </div>
          {/* Info */}
          <CardHeader className="p-4 gap-2">
            <div>
              <CardTitle className="text-sm truncate">
                {snippet.title || snippet.presentation.name || "Untitled Snippet"}
              </CardTitle>
              <CardDescription className="text-xs mt-0.5 truncate">{snippet.presentation.name}</CardDescription>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              <Badge variant="outline" size="sm">
                {label}
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

          {/* Footer */}
          <CardFooter className="px-4 py-3 border-t flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <ArrowBigUpDash className="size-3.5" />
                {snippet._count.upvotes}
              </span>
              <span className="flex items-center gap-1">
                <BookmarkIcon className="size-3.5" />
                {snippet._count.bookmarks}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground/60">
                <CalendarIcon className="size-3.5" />
                {formatDate(snippet.createdAt)}
              </span>
            </div>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}
