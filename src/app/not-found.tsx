"use client";
import { cn } from "@/utils/cn";
import { Link } from "@/components/link";
import { Button } from "@/components/ui/button";
import { AddSquare, Routing2 } from "@solar-icons/react";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

export default function Particle() {
  return (
    <div className={cn("h-screen flex flex-col")}>
      <main className="layout-fill">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Routing2 weight="BoldDuotone" aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>Page Not Found</EmptyTitle>
            <EmptyDescription>The page you are looking for doesn't exist..</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <div className="flex gap-2">
              <Button size="sm" render={<Link href="/" />}>
                <AddSquare weight="LineDuotone" className="mr-1 h-4 w-4" aria-hidden="true" />
                Create snippet
              </Button>

              <Button size="sm" variant="outline" render={<Link href="/explore" />}>
                Explore community
              </Button>
            </div>
          </EmptyContent>
        </Empty>
      </main>
    </div>
  );
}
