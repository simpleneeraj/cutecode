"use client";

import { useUser, SignInButton } from "@clerk/nextjs";
import { LogIn } from "lucide-react";
import { AnimatePresence, motion, Transition } from "motion/react";

import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/use-subscription";
import { Spinner } from "@/components/ui/spinner";
import { getRedirectUrlWithParam } from "@/utils/url";

import UserMenu from "../(create)/components/UserMenu";
import PlansDialog from "../(create)/components/PlansDialog";

const fadeSlide = {
  initial: { opacity: 0, x: 8, filter: "blur(4px)" },
  animate: { opacity: 1, x: 0, filter: "blur(0px)" },
  exit: { opacity: 0, x: -8, filter: "blur(4px)" },
};

const transition: Transition = { duration: 0.2, ease: "easeOut" };

enum AuthState {
  LOADING_AUTH = "loading-auth",
  SIGNED_OUT = "signed-out",
  LOADING_SUB = "loading-sub",
  PRO = "pro",
  FREE = "free",
}

export function AuthControls() {
  const { isSignedIn, isLoaded } = useUser();
  const { isPro, isLoaded: subLoaded } = useSubscription();

  const getAuthState = (): AuthState => {
    if (!isLoaded) return AuthState.LOADING_AUTH;
    if (!isSignedIn) return AuthState.SIGNED_OUT;
    if (!subLoaded) return AuthState.LOADING_SUB;
    if (isPro) return AuthState.PRO;
    return AuthState.FREE;
  };

  const stateKey = getAuthState();

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
        {stateKey === AuthState.LOADING_AUTH || stateKey === AuthState.LOADING_SUB ? (
          <div className="size-8 rounded-full flex items-center justify-center">
            <Spinner />
          </div>
        ) : stateKey === AuthState.SIGNED_OUT ? (
          <>
            <SignInButton mode="modal" forceRedirectUrl={getRedirectUrlWithParam("upgrade", "true")}>
              <Button variant="outline">
                <LogIn className="size-3.5" />
                Sign in
              </Button>
            </SignInButton>
            <PlansDialog />
          </>
        ) : stateKey === AuthState.PRO ? (
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
