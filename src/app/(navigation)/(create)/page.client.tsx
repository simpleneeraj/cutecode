"use client";

import { cn } from "@/utils/cn";
import Frame from "@/components/editor/Frame";
import Controls from "@/components/editor/controls";

export default function PageClient() {
  return (
    <div className={cn("app-code", "layout-scroll")}>
      <Frame />
      <Controls />
    </div>
  );
}
