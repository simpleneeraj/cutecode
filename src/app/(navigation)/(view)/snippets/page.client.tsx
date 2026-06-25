"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "@/components/link";
import { AddSquare, CodeSquare } from "@solar-icons/react";
import { useSnippetList } from "@/hooks/use-snippet";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { SnippetCard, type Snippet } from "./components/snippet-card";
import { SnippetSkeletonCard } from "./components/snippet-skeleton-card";
import { Badge } from "@/components/ui/badge";
import { BrowsePagination } from "../../components/browse-pagination";
import View from "@/components/view";

const GRID = "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

export default function SnippetsPageClient() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useSnippetList({ page, limit: 12 });

  const snippets = data?.snippets ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 12);

  return (
    <View className="layout-fill z-10">
      <View className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-6 sm:px-6 layout-fill">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">My Snippets</h1>
            <Badge variant="outline" className="tabular-nums">
              {isLoading ? "…" : total} {total !== 1 ? "snippets" : "snippet"}
            </Badge>
          </div>
          <Button size="sm" render={<Link href="/" />}>
            <AddSquare weight="LineDuotone" className="size-4" aria-hidden="true" />
            New Snippet
          </Button>
        </div>

        <View className="layout-scroll">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={GRID}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <SnippetSkeletonCard key={i} />
                ))}
              </motion.div>
            ) : snippets.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <Empty className="py-20">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <CodeSquare weight="BoldDuotone" aria-hidden="true" />
                    </EmptyMedia>
                    <EmptyTitle>No snippets yet</EmptyTitle>
                    <EmptyDescription>Publish a code snippet from the editor and it will appear here.</EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button render={<Link href="/" />}>
                      <AddSquare weight="LineDuotone" className="size-4" aria-hidden="true" />
                      Create your first snippet
                    </Button>
                  </EmptyContent>
                </Empty>
              </motion.div>
            ) : (
              <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={GRID}>
                {snippets.map((snippet, i) => (
                  <SnippetCard key={snippet.id} snippet={snippet as Snippet} index={i} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </View>

        <BrowsePagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </View>
    </View>
  );
}
