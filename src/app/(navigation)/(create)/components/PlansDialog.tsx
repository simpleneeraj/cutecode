"use client";

import React from "react";

import { useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
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
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const { openSignIn } = useClerk();
  const { plan, isPro, isLoaded: subLoaded } = useSubscription();
  const [isRedirecting, setIsRedirecting] = React.useState(false);

  const proPlan = PLANS[Plan.PRO];

  async function handleUpgradeClick() {
    // Not signed in → open Clerk sign-in modal, redirect back here after
    if (!isSignedIn) {
      openSignIn({ forceRedirectUrl: window.location.href });
      return;
    }

    // Already on Pro or above → go to customer portal to manage subscription
    if (isPro) {
      const res = await fetch("/api/customer-portal");
      const { customer_portal_url } = await res.json();
      window.location.href = customer_portal_url ?? "/pricing";
      return;
    }

    // Fetch the DodoPayments checkout URL, then redirect to it
    if (PRO_PRODUCT_ID) {
      try {
        setIsRedirecting(true);
        const res = await fetch(`/api/checkout?productId=${PRO_PRODUCT_ID}`);
        const { checkout_url } = await res.json();
        window.location.href = checkout_url;
      } catch {
        setIsRedirecting(false);
        router.push("/pricing");
      }
    } else {
      router.push("/pricing");
    }
  }

  // Don't render until both Clerk and subscription data are ready
  const loading = !isLoaded || !subLoaded || isRedirecting;

  // Already pro — show a "Manage" button instead of "Upgrade"
  if (isLoaded && isPro) {
    return (
      <Button variant="outline" size="sm" onClick={() => router.push("/api/customer-portal")} className="gap-1.5">
        <HugeiconsIcon icon={Crown03Icon} className="size-4 text-amber-500" />
        {plan} Plan
      </Button>
    );
  }

  return (
    <Dialog>
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
                    {!isSignedIn ? "Sign in to upgrade" : "Subscribe now"}
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

            <Button variant="link">Maybe later</Button>
          </div>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}
