import { Metadata } from "next";
import { cn } from "@/utils/cn";
import { TelescopeIcon } from "lucide-react";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

export const metadata: Metadata = {
  title: "Explore Code Screenshots — Discover Beautiful Code Snippets",
  description:
    "Browse beautiful code screenshots created by the CuteCode community. Get inspired by stunning code images across Python, JS, TypeScript, Rust, and more.",
};

export default function ExplorePage() {
  return (
    <div className={cn("h-screen flex flex-col")}>
      <main className="layout-fill">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <TelescopeIcon />
            </EmptyMedia>
            <EmptyTitle>Working on it</EmptyTitle>
            <EmptyDescription>Explore is coming soon. Check back later!</EmptyDescription>
          </EmptyHeader>
          <EmptyContent />
        </Empty>
      </main>
    </div>
  );
}
