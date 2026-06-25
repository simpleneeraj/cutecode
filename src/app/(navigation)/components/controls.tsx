"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSetAtom } from "jotai";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useUser } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { plansDialogOpenAtom } from "@/store/editor/plans";
import { AnimatePresence, motion, Transition } from "motion/react";
import ProfileDropdown from "../(view)/preview/components/profile-dropdown";
import { trackAuth, trackUpgrade } from "@/lib/analytics";

const fadeSlide = {
  initial: { opacity: 0, filter: "blur(4px)" },
  animate: { opacity: 1, filter: "blur(0px)" },
  exit: { opacity: 0, filter: "blur(4px)" },
};

const transition: Transition = { duration: 0.2, ease: "easeOut" };

enum AuthState {
  PRO = "pro",
  FREE = "free",
  SIGNED_OUT = "signed-out",
  LOADING_SUB = "loading-sub",
  LOADING_AUTH = "loading-auth",
}
/**
 * Basic flow for auth and subscription UI
 * LOADING       → Spinner
 * SIGNED_OUT    → [Sign In]
 * FREE          → [Upgrade to Pro]  [UserMenu]
 * PRO           → [UserMenu]
 */

export default function AuthControls() {
  const { isSignedIn, isLoaded } = useUser();
  const { isPro, isLoaded: subLoaded } = useSubscription();
  const setOpen = useSetAtom(plansDialogOpenAtom);
  const pathname = usePathname();

  const stateKey = React.useMemo(() => {
    if (!isLoaded) return AuthState.LOADING_AUTH;
    if (!isSignedIn) return AuthState.SIGNED_OUT;
    if (!subLoaded) return AuthState.LOADING_SUB;
    if (isPro) return AuthState.PRO;
    return AuthState.FREE;
  }, [isLoaded, isSignedIn, subLoaded, isPro]);

  const content = React.useMemo(() => {
    switch (stateKey) {
      case AuthState.LOADING_AUTH:
      case AuthState.LOADING_SUB:
        return (
          <Button variant="outline">
            <Spinner />
          </Button>
        );

      case AuthState.SIGNED_OUT:
        return (
          <Button
            variant="outline"
            onClick={() => trackAuth.signInClicked("header")}
            render={
              <Link href={`/account/sign-in?redirectedFrom=${encodeURIComponent(pathname ?? "/")}`} />
            }
          >
            <Icon icon="solar:login-3-linear" className="size-3.5" />
            Sign in
          </Button>
        );
      case AuthState.FREE:
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                trackUpgrade.dialogOpened("header");
                setOpen(true);
              }}
            >
              <Icon icon="solar:crown-linear" className="size-3.5" />
              Upgrade to Pro
            </Button>
            <ProfileDropdown />
          </div>
        );

      case AuthState.PRO:
        return <ProfileDropdown />;
    }
  }, [stateKey, setOpen]);

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
        {content}
      </motion.div>
    </AnimatePresence>
  );
}
