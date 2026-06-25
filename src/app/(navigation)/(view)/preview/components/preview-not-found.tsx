"use client";
import { cn } from "@/utils/cn";
import { Link } from "@/components/link";
import { Button } from "@/components/ui/button";
import { AddSquare, InfoCircle } from "@solar-icons/react";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

export default function SnippetNotFound() {
  return (
    <div className={cn("h-screen flex flex-col")}>
      <main className="layout-fill">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <InfoCircle weight="BoldDuotone" aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>Snippet Not Found</EmptyTitle>
            <EmptyDescription>This snippet may have been deleted or the link is incorrect.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <div className="flex gap-2">
              <Button size="sm" render={<Link href="/" />}>
                <AddSquare weight="LineDuotone" className="mr-1 h-4 w-4" aria-hidden="true" />
                Create snippet
              </Button>
            </div>
          </EmptyContent>
        </Empty>
      </main>
    </div>
  );
}
