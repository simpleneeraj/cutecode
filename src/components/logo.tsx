import React from "react";
import { cn } from "@/utils/cn";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 font-bold text-xl tracking-tight", className)}>
      <div className="size-6 rounded-lg bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
        <div className="size-2.5 rounded-full bg-white/90" />
      </div>
      <span className="bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/70">CuteCode</span>
    </div>
  );
}
