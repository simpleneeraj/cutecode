"use client";

import React from "react";
import siteConfig from "@/contstant/site-config";
import { Separator } from "@/components/ui/separator";
import AuthControls from "../../../components/controls";
import { ThemeCustomizationDrawer } from "./theme-customization";
import { AnimatePresence, motion, Transition } from "motion/react";

const transition: Transition = { duration: 0.2, ease: "easeOut" };

type PreviewSnippetHeaderProps = {
  title?: string;
} & React.PropsWithChildren;

export function PreviewSnippetHeader({ title, children }: PreviewSnippetHeaderProps) {
  return (
    <header className="border-b bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60 z-50">
      <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6 max-w-3xl mx-auto w-full">
        <div className="flex flex-1 shrink-0 items-center gap-1.5">
          <span className="font-heading text-xl sm:text-[1.625em] leading-none">{siteConfig.name}</span>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={transition}
              className="text-muted-foreground/60 font-heading text-xl sm:text-[1.625em] leading-none"
            >
              {title}
            </motion.span>
          </AnimatePresence>
        </div>
        {children}
        <div className="flex flex-1 items-center justify-end gap-1.5">
          <AuthControls />
        </div>
      </div>
    </header>
  );
}
