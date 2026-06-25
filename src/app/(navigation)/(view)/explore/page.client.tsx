"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ClockCircle, Fire, Telescope } from "@solar-icons/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { useSnippetExplore } from "@/hooks/use-snippet";
import { ExploreSnippetCard } from "./components/explore-snippet-card";
import { SnippetSkeletonCard } from "../snippets/components/snippet-skeleton-card";
import { BrowsePagination } from "../../components/browse-pagination";
import { staggerContainer, EASE_OUT } from "@/lib/motion";
import { cn } from "@/utils/cn";
import View from "@/components/view";

const POPULAR_LANGUAGES = ["typescript", "python", "javascript", "rust", "go", "bash", "sql"];
const GRID = "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

export default function ExplorePageClient() {
  const [sort, setSort] = useState<"recent" | "popular">("recent");
  const [language, setLanguage] = useState<string | undefined>();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useSnippetExplore({ page, sort, language, limit: 24 });

  const snippets = data?.snippets ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 24);

  function handleLanguageToggle(lang: string) {
    setLanguage((prev) => (prev === lang ? undefined : lang));
    setPage(1);
  }

  function handleSortChange(newSort: "recent" | "popular") {
    setSort(newSort);
    setPage(1);
  }

  return (
    <View className="layout-fill z-10">
      <View className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-6 sm:px-6 layout-fill">
        {/* Toolbar */}
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">Explore</h1>
            <Badge variant="outline" className="tabular-nums">
              {isLoading ? "…" : total} snippets
            </Badge>
          </div>

          <div className="flex items-center gap-1 rounded-lg bg-muted/60 p-1">
            <Button
              size="sm"
              variant={sort === "recent" ? "default" : "ghost"}
              className="h-7 gap-1.5 text-xs"
              onClick={() => handleSortChange("recent")}
            >
              <ClockCircle weight="LineDuotone" className="size-3.5" aria-hidden="true" />
              Recent
            </Button>
            <Button
              size="sm"
              variant={sort === "popular" ? "default" : "ghost"}
              className="h-7 gap-1.5 text-xs"
              onClick={() => handleSortChange("popular")}
            >
              <Fire weight="BoldDuotone" className="size-3.5" aria-hidden="true" />
              Popular
            </Button>
          </div>
        </div>

        {/* Language filters */}
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_LANGUAGES.map((lang) => (
            <Badge
              key={lang}
              variant={language === lang ? "default" : "outline"}
              className={cn("cursor-pointer select-none transition-colors")}
              onClick={() => handleLanguageToggle(lang)}
            >
              {lang}
            </Badge>
          ))}
          {language && (
            <Badge
              variant="secondary"
              className="cursor-pointer select-none"
              onClick={() => {
                setLanguage(undefined);
                setPage(1);
              }}
            >
              Clear filter ×
            </Badge>
          )}
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
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ ease: EASE_OUT, duration: 0.25 }}
              >
                <Empty className="py-20">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Telescope weight="BoldDuotone" aria-hidden="true" />
                    </EmptyMedia>
                    <EmptyTitle>Nothing here yet</EmptyTitle>
                    <EmptyDescription>
                      {language
                        ? `No public ${language} snippets found. Try a different language or clear the filter.`
                        : "No public snippets yet. Create and publish yours to be the first!"}
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent />
                </Empty>
              </motion.div>
            ) : (
              <motion.div
                key={`grid-${sort}-${language}-${page}`}
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
                className={GRID}
              >
                {snippets.map((snippet, i) => (
                  <ExploreSnippetCard key={snippet.id} snippet={snippet} index={i} />
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
