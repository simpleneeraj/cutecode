import { cn } from "@/utils/cn";

/**
 * Monochrome CuteCode mark — a code-chevron on a solid foreground square.
 * Matches the browser favicon (src/app/icon.tsx). Pass a size via className
 * on the box, e.g. `size-7`.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-lg bg-foreground text-background",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-[60%]" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 9L11 12L8 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13 15H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </span>
  );
}
