"use client";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import { PlusIcon, RouteIcon } from "lucide-react";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { useRouter } from "next/navigation";

export default function Particle() {
  const router = useRouter();
  return (
    <div className={cn("h-screen flex flex-col")}>
      <main className="layout-fill">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <RouteIcon />
            </EmptyMedia>
            <EmptyTitle>Page Not Found</EmptyTitle>
            <EmptyDescription>The page you are looking for doesn't exist..</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => router.push("/")}>
                <PlusIcon className="mr-1 h-4 w-4" />
                Create snippet
              </Button>

              <Button size="sm" variant="outline" onClick={() => router.push("/explore")}>
                Explore community
              </Button>
            </div>
          </EmptyContent>
        </Empty>
      </main>
    </div>
  );
}
