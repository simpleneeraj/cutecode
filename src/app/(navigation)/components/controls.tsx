"use client";

import React from "react";
import { useSetAtom } from "jotai";
import { LogIn } from "lucide-react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useUser, SignInButton } from "@clerk/nextjs";
import { getRedirectUrlWithParam } from "@/utils/url";
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
          <SignInButton mode="redirect" forceRedirectUrl={getRedirectUrlWithParam("ref", "header")}>
            <Button variant="outline" onClick={() => trackAuth.signInClicked("header")}>
              <LogIn className="size-3.5" />
              Sign in
            </Button>
          </SignInButton>
        );
      case AuthState.FREE:
        return (
          <React.Fragment>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex items-center gap-2"
            >
              <Button
                variant="outline"
                onClick={() => {
                  trackUpgrade.dialogOpened("header");
                  setOpen(true);
                }}
                className="group relative overflow-hidden rounded-lg border-amber-500/40 bg-amber-500/8 text-xs hover:border-amber-400/70 hover:bg-amber-500/12 transition-all duration-200"
              >
                {/* shimmer */}
                <motion.span
                  className="pointer-events-none absolute inset-0 bg-linear-to-r from-transparent via-amber-300/15 to-transparent"
                  animate={{ x: ["-200%", "200%"] }}
                  transition={{ duration: 2, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }}
                />
                <motion.span
                  animate={{ rotate: [0, -12, 12, -6, 6, 0] }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}
                >
                  <Icon icon="solar:crown-star-bold" className="size-3.5 text-amber-400" />
                </motion.span>

                <span className="relative bg-linear-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                  Upgrade to Pro
                </span>
              </Button>
              <ProfileDropdown />
            </motion.div>
          </React.Fragment>
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
