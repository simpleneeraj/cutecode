import { Metadata } from "next";
import { cn } from "@/utils/cn";
import { TelescopeIcon } from "lucide-react";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

export const metadata: Metadata = {
  title: "Explore | CuteCode",
  description: "Explore the best code snippets and tools crafted for CuteCode.",
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
