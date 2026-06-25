"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Icon } from "@/components/ui/icon";
import { CodeIcon, PlusIcon } from "lucide-react";
import { useSnippetList } from "@/hooks/use-snippet";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { SnippetCard, type Snippet } from "./components/snippet-card";
import { SnippetSkeletonCard } from "./components/snippet-skeleton-card";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import View from "@/components/view";

export default function SnippetsPageClient() {
  const router = useRouter();

  const [page, setPage] = useState(1);
  const { data, isLoading } = useSnippetList({ page, limit: 12 });

  const snippets = data?.snippets ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 12);

  return (
    <View className="layout-fill z-10 border">
      <View className="flex flex-col gap-6 py-6 px-4 sm:px-6 max-w-3xl mx-auto w-full layout-fill">
        <View className="flex items-center justify-between gap-4">
          <View className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-foreground">My Snippets</h1>
            <Badge variant="outline">
              {!isLoading && total} {total !== 1 ? "Snippets" : "Snippet"}
            </Badge>
          </View>
          <Button size="sm" className="gap-1.5" onClick={() => router.push("/")}>
            <PlusIcon className="size-4" />
            New Snippet
          </Button>
        </View>
        <View className="layout-scroll p-1 rounded-3xl">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <SnippetSkeletonCard key={i} />
                ))}
              </motion.div>
            ) : snippets.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <Empty className="py-20">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <CodeIcon />
                    </EmptyMedia>
                    <EmptyTitle>No snippets yet</EmptyTitle>
                    <EmptyDescription>Publish a code snippet from the editor and it will appear here.</EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button className="gap-2" onClick={() => router.push("/")}>
                      <PlusIcon className="size-4" />
                      Create your first snippet
                    </Button>
                  </EmptyContent>
                </Empty>
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
              >
                {snippets.map((snippet, i) => (
                  <SnippetCard key={snippet.id} snippet={snippet as Snippet} index={i} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </View>

        {/* Pagination */}
        {totalPages > 1 && (
          <View className="flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              <Icon icon="solar:arrow-left-linear" className="size-4" />
              Previous
            </Button>
            <span className="text-xs text-muted-foreground px-2 tabular-nums">
              {page} / {totalPages}
            </span>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
              <Icon icon="solar:arrow-right-linear" className="size-4" />
            </Button>
          </View>
        )}
      </View>
    </View>
  );
}
