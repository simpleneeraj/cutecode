"use client";

import React from "react";

import { useUser } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import { Fingerprint, CrownIcon, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Crown03Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useSubscription } from "@/hooks/use-subscription";
import { Plan } from "@/generated/prisma/enums";
import { PLANS } from "@/lib/billing/plans";
import useBilling from "@/hooks/use-billing";
import { getRedirectUrlWithParam, removeSearchParam, hasSearchParam } from "@/utils/url";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { locationAtom, plansDialogOpenAtom } from "../store/plans-dialog";

const PRO_PRODUCT_ID = process.env.NEXT_PUBLIC_DODO_PRODUCT_PRO;

function PriceTag({ price, discountedPrice }: { price: number; discountedPrice: number }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-bold bg-linear-to-br from-zinc-900 to-zinc-700 bg-clip-text text-transparent dark:from-white dark:to-zinc-300">
          ${discountedPrice}
        </span>
        <span className="text-lg line-through text-zinc-400">${price}</span>
      </div>

      <div className="flex flex-col text-right">
        <span className="text-sm font-medium">per month</span>
        <span className="text-xs text-zinc-500">Cancel anytime</span>
      </div>
    </div>
  );
}

function ProFeatureList() {
  const features = [
    { icon: "✓", label: "Unlimited code exports" },
    { icon: "✓", label: "HD image quality" },
    { icon: "✓", label: "All premium themes" },
    { icon: "✓", label: "No watermark" },
    { icon: "✓", label: "Unlimited saved snippets" },
  ];

  return (
    <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
      {features.map((f) => (
        <li key={f.label} className="flex items-center gap-2">
          <span className="text-emerald-500 font-bold">{f.icon}</span>
          {f.label}
        </li>
      ))}
    </ul>
  );
}

export default function PlansDialog() {
  const { isSignedIn, isLoaded } = useUser();
  const { plan, isPro, isLoaded: subLoaded } = useSubscription();
  const { openBilling, openPortal, isLoading } = useBilling();

  const proPlan = PLANS[Plan.PRO];
  // Global open state
  const [open, setOpen] = useAtom(plansDialogOpenAtom);

  // Auto-open after sign-in via ?upgrade=true
  const [loc, setLoc] = useAtom(locationAtom);

  React.useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (hasSearchParam(loc.searchParams, "upgrade", "true")) {
      setOpen(true);
      // Clean ?upgrade=true from URL without adding a history entry
      setLoc((prev) => ({
        ...prev,
        searchParams: removeSearchParam(prev.searchParams, "upgrade"),
      }));
    }
  }, [isLoaded, isSignedIn, loc.searchParams, setOpen, setLoc]);

  async function handleUpgradeClick() {
    await openBilling(PRO_PRODUCT_ID);
  }

  const loading = !isLoaded || !subLoaded || isLoading;

  if (isLoaded && isPro) {
    return (
      <Button variant="outline" size="sm" onClick={openPortal} className="gap-1.5">
        <HugeiconsIcon icon={Crown03Icon} className="size-4 text-amber-500" />
        {plan} Plan
      </Button>
    );
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />} className="gap-1.5">
        <HugeiconsIcon icon={Crown03Icon} />
        Upgrade to Pro
      </DialogTrigger>

      <DialogPopup className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CrownIcon className="size-18 text-amber-500" />
            Upgrade to Pro
          </DialogTitle>

          <DialogDescription>
            Unlock premium features and export high-quality code images without limits.
          </DialogDescription>
        </DialogHeader>

        <DialogPanel className="space-y-6">
          <PriceTag price={proPlan.price * 2} discountedPrice={proPlan.price} />
          <ProFeatureList />
        </DialogPanel>

        <DialogFooter className="flex-1">
          <div className="flex-1 flex flex-col gap-3">
            {!isSignedIn ? (
              <SignInButton
                mode="modal"
                forceRedirectUrl={getRedirectUrlWithParam("upgrade", "true")}
              >
                <button
                  type="button"
                  className="group relative inline-flex h-10 w-full items-center justify-center overflow-hidden rounded-xl bg-linear-to-r from-rose-500 to-pink-500 font-semibold text-sm text-white tracking-wide shadow-lg shadow-rose-500/20 transition-all duration-500 hover:from-rose-600 hover:to-pink-600 hover:shadow-rose-500/30 hover:shadow-xl dark:from-rose-600 dark:to-pink-600 dark:hover:from-rose-500 dark:hover:to-pink-500"
                >
                  <motion.span
                    className="absolute inset-0 translate-x-[-200%] bg-linear-to-r from-transparent via-white/20 to-transparent"
                    transition={{ duration: 1.5, ease: "easeInOut", repeat: 0 }}
                    whileHover={{ x: ["-200%", "200%"] }}
                  />
                  <motion.div
                    animate={{ opacity: 1 }}
                    className="relative flex items-center gap-2 tracking-tighter"
                    initial={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    Sign in to upgrade
                    <motion.div
                      animate={{ rotate: [0, 15, -15, 0], y: [0, -2, 2, 0] }}
                      transition={{ duration: 2, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY, repeatDelay: 1 }}
                    >
                      <Fingerprint className="h-4 w-4" />
                    </motion.div>
                  </motion.div>
                </button>
              </SignInButton>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={handleUpgradeClick}
                className="group relative inline-flex h-10 w-full items-center justify-center overflow-hidden rounded-xl bg-linear-to-r from-rose-500 to-pink-500 font-semibold text-sm text-white tracking-wide shadow-lg shadow-rose-500/20 transition-all duration-500 hover:from-rose-600 hover:to-pink-600 hover:shadow-rose-500/30 hover:shadow-xl dark:from-rose-600 dark:to-pink-600 dark:hover:from-rose-500 dark:hover:to-pink-500 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <motion.span
                      className="absolute inset-0 translate-x-[-200%] bg-linear-to-r from-transparent via-white/20 to-transparent"
                      transition={{ duration: 1.5, ease: "easeInOut", repeat: 0 }}
                      whileHover={{ x: ["-200%", "200%"] }}
                    />
                    <motion.div
                      animate={{ opacity: 1 }}
                      className="relative flex items-center gap-2 tracking-tighter"
                      initial={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      Subscribe now
                      <motion.div
                        animate={{ rotate: [0, 15, -15, 0], y: [0, -2, 2, 0] }}
                        transition={{
                          duration: 2,
                          ease: "easeInOut",
                          repeat: Number.POSITIVE_INFINITY,
                          repeatDelay: 1,
                        }}
                      >
                        <Fingerprint className="h-4 w-4" />
                      </motion.div>
                    </motion.div>
                  </>
                )}
              </button>
            )}

            <Button
              variant="link"
              onClick={() => {
                setOpen(false);
                setLoc((prev) => ({
                  ...prev,
                  searchParams: removeSearchParam(prev.searchParams, "upgrade"),
                }));
              }}
            >
              Maybe later
            </Button>
          </div>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}
