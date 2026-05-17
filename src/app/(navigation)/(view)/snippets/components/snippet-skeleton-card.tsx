"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardFooter } from "@/components/ui/card";

export function SnippetSkeletonCard() {
  return (
    <Card className="gap-0 p-0 overflow-hidden">
      <Skeleton className="h-36 w-full rounded-none" />
      <CardHeader className="p-4 gap-2.5">
        <div className="flex items-start justify-between gap-3 w-full">
          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            <Skeleton className="h-4 w-2/3 rounded-md" />
            <Skeleton className="h-3 w-1/3 rounded-md" />
          </div>
          <Skeleton className="size-7 rounded-lg shrink-0" />
        </div>
        <div className="flex gap-1.5">
          <Skeleton className="h-4.5 w-14 rounded-sm" />
          <Skeleton className="h-4.5 w-16 rounded-sm" />
        </div>
      </CardHeader>
      <CardFooter className="px-4 py-3 border-t">
        <Skeleton className="h-3 w-28 rounded-sm" />
      </CardFooter>
    </Card>
  );
}
