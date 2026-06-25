import { AltArrowLeft, AltArrowRight } from "@solar-icons/react";
import { Button } from "@/components/ui/button";

/**
 * Shared pager for the snippets and explore browse grids. Compact, monochrome,
 * Solar line-duotone chevrons.
 */
export function BrowsePagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 pt-2">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        <AltArrowLeft weight="LineDuotone" className="size-4" aria-hidden="true" />
        Previous
      </Button>
      <span className="px-2 text-xs tabular-nums text-muted-foreground">
        {page} / {totalPages}
      </span>
      <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        Next
        <AltArrowRight weight="LineDuotone" className="size-4" aria-hidden="true" />
      </Button>
    </div>
  );
}
