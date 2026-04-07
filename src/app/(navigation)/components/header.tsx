"use client";

import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, Transition } from "motion/react";

import ThemeSwitch from "@/components/theme-switch";
import { Tabs, TabsList, TabsTab } from "@/components/ui/tabs";
import FormatButton from "../(create)/components/FormatCodeButton";
import ExportButton from "../(create)/components/ExportButton";
import siteConfig from "@/contstant/site-config";
import { Separator } from "@/components/ui/separator";
import { HeaderAuthControls } from "./controls";

const tabs = [
  { label: "Create", value: "create", href: "/" },
  { label: "Explore", value: "explore", href: "/explore" },
  { label: "Snippets", value: "snippets", href: "/snippets" },
] as const;

const transition: Transition = { duration: 0.2, ease: "easeOut" };

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const activeTab = tabs.find(({ href }) => href === pathname);

  return (
    <header className="border-b bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60">
      <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex flex-1 shrink-0 items-center gap-1.5">
          <span className="font-heading text-xl sm:text-[1.625em] leading-none">{siteConfig.name}</span>
          <AnimatePresence mode="wait" initial={false}>
            {activeTab && (
              <motion.span
                key={activeTab.label}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={transition}
                className="text-muted-foreground/60 lowercase font-heading text-xl sm:text-[1.625em] leading-none"
              >
                {activeTab.label}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <Tabs value={pathname} onValueChange={(href) => router.push(href)}>
          <TabsList>
            {tabs.map((tab) => (
              <TabsTab key={tab.value} value={tab.href}>
                {tab.label}
              </TabsTab>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex flex-1 items-center justify-end gap-1.5">
          <FormatButton />
          <ExportButton />
          <ThemeSwitch />
          <Separator orientation="vertical" className="h-5" />
          <HeaderAuthControls />
        </div>
      </div>
    </header>
  );
}
