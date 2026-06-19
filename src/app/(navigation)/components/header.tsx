"use client";

import AuthControls from "./controls";
import Navigations from "./navigation";
import { usePathname } from "next/navigation";
import siteConfig from "@/contstant/site-config";
import { Separator } from "@/components/ui/separator";
import ExportButton from "@/components/editor/export";
import { AnimatePresence, motion, Transition } from "motion/react";
import InfoDialog from "@/components/editor/dialogs/info";

const transition: Transition = { duration: 0.2, ease: "easeOut" };

export function Header() {
  const pathname = usePathname();
  const activeTab = siteConfig.tabs.find(({ href }) => href === pathname);

  return (
    <header className="border-b bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60">
      {/* Main row */}
      <div className="flex h-14 sm:h-16 items-center justify-between gap-3 px-4 md:px-6">
        <div className="flex shrink-0 items-center gap-1.5">
          <img src={siteConfig.logo} alt="" className="size-6" />
          <span className="font-heading text-lg sm:text-[1.625em] leading-none">{siteConfig.name}</span>
          <AnimatePresence mode="wait" initial={false}>
            {activeTab && (
              <motion.span
                key={activeTab.label}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={transition}
                className="hidden sm:inline text-muted-foreground/60 font-heading text-[1.625em] leading-none"
              >
                {activeTab.label}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Desktop navigation — hidden on mobile, shown in row below */}
        <div className="hidden sm:flex">
          <Navigations />
        </div>

        <div className="flex items-center justify-end gap-1.5">
          <ExportButton />
          <Separator orientation="vertical" className="h-5" />
          <AuthControls />
        </div>
      </div>

      {/* Mobile navigation row */}
      <div className="flex sm:hidden border-t px-2 py-1">
        <Navigations />
      </div>
    </header>
  );
}
