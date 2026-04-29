"use client";

import { useEffect } from "react";
import { getHighlighter } from "./lib/highlighter";
import { useFrameContext } from "./store/context/frame";

import Frame from "./components/Frame";
import Controls from "./components/controls";
import NoSSR from "./components/NoSSR";

import styles from "./code.module.css";
import { cn } from "@/utils/cn";

export function Code() {
  const { setHighlighter } = useFrameContext();

  useEffect(() => {
    // `getHighlighter()` returns the cached singleton promise —
    // remounts and hot-reloads will await the same promise without
    // creating a second Shiki instance.
    let cancelled = false;

    getHighlighter().then((instance) => {
      if (!cancelled) setHighlighter(instance);
    });

    return () => {
      cancelled = true;
      // Do NOT call highlighter.dispose() here — the singleton must
      // outlive any individual mount/unmount cycle.
    };
  }, [setHighlighter]);

  return (
    <div className={cn(styles.app, "layout-scroll")}>
      <NoSSR>
        <Frame />
        <Controls />
      </NoSSR>
    </div>
  );
}
