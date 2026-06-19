"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { TelescopeIcon, TrendingUpIcon, ClockIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { useSnippetExplore } from "@/hooks/use-snippet";
import { ExploreSnippetCard } from "./components/explore-snippet-card";
import { staggerContainer, staggerItem, EASE_OUT } from "@/lib/motion";
import { cn } from "@/utils/cn";
import View from "@/components/view";

const POPULAR_LANGUAGES = ["typescript", "python", "javascript", "rust", "go", "bash", "sql"];

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
      <View className="flex flex-col gap-6 py-6 px-4 sm:px-6 max-w-6xl mx-auto w-full layout-fill">
        {/* Header row */}
        <View className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <View className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-foreground">Explore</h1>
            <Badge variant="outline">{!isLoading ? total : "…"} snippets</Badge>
          </View>

          {/* Sort toggles */}
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
            <Button
              size="sm"
              variant={sort === "recent" ? "default" : "ghost"}
              className="h-7 gap-1.5 text-xs"
              onClick={() => handleSortChange("recent")}
            >
              <ClockIcon className="size-3.5" />
              Recent
            </Button>
            <Button
              size="sm"
              variant={sort === "popular" ? "default" : "ghost"}
              className="h-7 gap-1.5 text-xs"
              onClick={() => handleSortChange("popular")}
            >
              <TrendingUpIcon className="size-3.5" />
              Popular
            </Button>
          </div>
        </View>

        {/* Language filters */}
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_LANGUAGES.map((lang) => (
            <Badge
              key={lang}
              variant={language === lang ? "default" : "outline"}
              className={cn(
                "cursor-pointer select-none transition-colors",
                language === lang && "bg-brand text-white border-brand",
              )}
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

        {/* Grid */}
        <View className="layout-scroll">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="h-52 rounded-xl bg-muted animate-pulse" />
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
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <TelescopeIcon />
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
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              >
                {snippets.map((snippet, i) => (
                  <ExploreSnippetCard key={snippet.id} snippet={snippet} index={i} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pagination */}
          {totalPages > 1 && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-2 mt-8 pb-6"
            >
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </motion.div>
          )}
        </View>
      </View>
    </View>
  );
}
