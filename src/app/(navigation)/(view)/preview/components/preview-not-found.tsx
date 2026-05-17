"use client";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import { PlusIcon, Info } from "lucide-react";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { useRouter } from "next/navigation";

export default function SnippetNotFound() {
  const router = useRouter();
  return (
    <div className={cn("h-screen flex flex-col")}>
      <main className="layout-fill">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Info />
            </EmptyMedia>
            <EmptyTitle>Snippet Not Found</EmptyTitle>
            <EmptyDescription>This snippet may have been deleted or the link is incorrect.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => router.push("/")}>
                <PlusIcon className="mr-1 h-4 w-4" />
                Create snippet
              </Button>
            </div>
          </EmptyContent>
        </Empty>
      </main>
    </div>
  );
}
