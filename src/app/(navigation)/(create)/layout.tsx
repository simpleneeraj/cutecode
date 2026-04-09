"use client";

import React from "react";
import { cn } from "@/utils/cn";
import { useAtomValue } from "jotai";
import { themeAtom } from "./store/editor";

export default function CodeLayout({ children }: { children: React.ReactNode }) {
  const theme = useAtomValue(themeAtom);
  const fromColor = theme?.background?.from ?? "transparent";
  const toColor = theme?.background?.to ?? "transparent";

  return (
    <div className="relative layout-fill">
      {/* Dot grid */}
      <div
        className={cn(
          "absolute inset-0",
          "bg-size-[20px_20px]",
          "bg-[radial-gradient(#d4d4d4_1px,transparent_1px)]",
          "dark:bg-[radial-gradient(#404040_1px,transparent_1px)]",
        )}
      />
      {/* Radial gradient for the container to give a faded look */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background mask-[radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>

      {/* YouTube-style ambient glow — centered color blob bleeding into the background */}
      {/* <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
      >
        <div
          style={{
            width: "70%",
            height: "60%",
            background: `radial-gradient(ellipse at center, ${fromColor} 0%, ${toColor} 50%, transparent 100%)`,
            filter: "blur(120px)",
            opacity: 0.55,
            transition: "background 1s ease, opacity 1s ease",
            borderRadius: "50%",
            flexShrink: 0,
          }}
        />
      </div> */}

      {children}
    </div>
  );
}
