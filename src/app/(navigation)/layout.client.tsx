"use client";

import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import { LogIn } from "lucide-react";
import { AnimatePresence, motion, Transition } from "motion/react";

import ThemeSwitch from "@/components/theme-switch";
import { Tabs, TabsList, TabsTab } from "@/components/ui/tabs";
import FormatButton from "./(create)/components/FormatCodeButton";
import ExportButton from "./(create)/components/ExportButton";
import UserMenu from "./(create)/components/UserMenu";
import PlansDialog from "./(create)/components/PlansDialog";
import View from "@/components/view";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/use-subscription";
import siteConfig from "@/contstant/site-config";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { getRedirectUrlWithParam } from "@/utils/url";

const tabs = [
  { label: "Create", value: "create", href: "/" },
  { label: "Explore", value: "explore", href: "/explore" },
  { label: "Snippets", value: "snippets", href: "/snippets" },
] as const;

const fadeSlide = {
  initial: { opacity: 0, x: 8, filter: "blur(4px)" },
  animate: { opacity: 1, x: 0, filter: "blur(0px)" },
  exit: { opacity: 0, x: -8, filter: "blur(4px)" },
};

const transition: Transition = { duration: 0.2, ease: "easeOut" };

function HeaderAuthControls() {
  const { isSignedIn, isLoaded } = useUser();
  const { isPro, isLoaded: subLoaded } = useSubscription();

  const stateKey = !isLoaded
    ? "loading-auth"
    : !isSignedIn
      ? "signed-out"
      : !subLoaded
        ? "loading-sub"
        : isPro
          ? "pro"
          : "free";

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={stateKey}
        variants={fadeSlide}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={transition}
        className="flex items-center gap-2"
      >
        {stateKey === "loading-auth" || stateKey === "loading-sub" ? (
          <div className="size-8 rounded-full flex items-center justify-center">
            <Spinner />
          </div>
        ) : stateKey === "signed-out" ? (
          <>
            <SignInButton
              mode="modal"
              forceRedirectUrl={getRedirectUrlWithParam("upgrade", "true")}
            >
              <Button variant="outline">
                <LogIn className="size-3.5" />
                Sign in
              </Button>
            </SignInButton>
            <PlansDialog />
          </>
        ) : stateKey === "pro" ? (
          <UserMenu />
        ) : (
          <>
            <PlansDialog />
            <UserMenu />
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export default function CodeLayoutClient({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const activeTab = tabs.find(({ href }) => href === pathname);

  return (
    <View className="layout-fill">
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

      {children}
    </View>
  );
}
