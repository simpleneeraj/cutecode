"use client";

import { motion, AnimatePresence } from "motion/react";
import { useUser } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import { Fingerprint, Loader2, Zap, ImageIcon, Palette, Bookmark, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAtom } from "jotai";
import { Icon } from "@iconify/react";
import { PLANS } from "@/lib/billing/plans";
import useBilling from "@/hooks/use-billing";
import { Plan } from "@/generated/prisma/enums";
import { getRedirectUrlWithParam } from "@/utils/url";
import { useSubscription } from "@/hooks/use-subscription";
import { plansDialogOpenAtom } from "@/store/editor/plans";
import { trackUpgrade } from "@/lib/analytics";

const PRO_PRODUCT_ID = process.env.NEXT_PUBLIC_DODO_PRODUCT_PRO;

interface Props {
  trigger?: React.ReactNode;
}

export default function PlansDialog({ trigger }: Props) {
  const { isSignedIn, isLoaded } = useUser();
  const { isLoaded: subLoaded } = useSubscription();
  const { openBilling, isLoading } = useBilling();

  const proPlan = PLANS[Plan.PRO];
  const [open, setOpen] = useAtom(plansDialogOpenAtom);

  async function onUpgradePlan() {
    trackUpgrade.ctaClicked(true);
    await openBilling(PRO_PRODUCT_ID);
  }

  const loading = !isLoaded || !subLoaded || isLoading;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger}
      <DialogPopup className="sm:max-w-md rounded-2xl overflow-hidden">
        {/* Ambient glow strip at top */}
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-amber-500/60 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-b from-amber-500/8 to-transparent pointer-events-none" />

        <DialogHeader className="relative">
          <DialogTitle className="flex items-center gap-2.5 text-xl">
            <motion.div
              className="flex size-8 items-center justify-center rounded-xl bg-linear-to-br from-amber-400 to-orange-500 shadow-md shadow-amber-500/30"
              animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 5, ease: "easeInOut" }}
            >
              <Icon icon="solar:crown-star-bold" className="size-4 text-white" />
            </motion.div>
            Upgrade to Pro
          </DialogTitle>
          <DialogDescription>
            Unlock premium features and export high-quality code images without limits.
          </DialogDescription>
        </DialogHeader>

        <DialogPanel className="space-y-5 relative">
          <PriceTag price={proPlan.price * 2} discountedPrice={proPlan.price} />
          <div className="h-px bg-border" />
          <ProFeatureList />
        </DialogPanel>

        <DialogFooter className="flex-1 relative">
          <div className="flex-1 flex flex-col gap-2">
            {!isSignedIn ? (
              <SignInButton forceRedirectUrl={getRedirectUrlWithParam("upgrade", "true")}>
                <Button
                  type="button"
                  onClick={() => trackUpgrade.ctaClicked(false)}
                  className="w-full relative overflow-hidden bg-linear-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 hover:from-amber-400 hover:to-orange-400 transition-shadow"
                >
                  <motion.span
                    className="absolute inset-0 translate-x-[-200%] bg-linear-to-r from-transparent via-white/25 to-transparent"
                    whileHover={{ x: ["-200%", "200%"] }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                  />
                  <motion.div
                    className="relative flex items-center gap-2 tracking-tight"
                    animate={{ opacity: 1 }}
                    initial={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    Sign in to upgrade
                    <motion.div
                      animate={{ rotate: [0, 15, -15, 0], y: [0, -2, 2, 0] }}
                      transition={{ duration: 2, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }}
                    >
                      <Fingerprint className="size-4" />
                    </motion.div>
                  </motion.div>
                </Button>
              </SignInButton>
            ) : (
              <Button
                type="button"
                disabled={loading}
                onClick={onUpgradePlan}
                className="w-full relative overflow-hidden bg-linear-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 hover:from-amber-400 hover:to-orange-400 transition-shadow"
              >
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.span
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Loader2 className="size-4 animate-spin" />
                    </motion.span>
                  ) : (
                    <motion.div
                      key="cta"
                      className="relative flex items-center gap-2 tracking-tight"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <motion.span
                        className="absolute inset-0 translate-x-[-200%] bg-linear-to-r from-transparent via-white/25 to-transparent"
                        whileHover={{ x: ["-200%", "200%"] }}
                        transition={{ duration: 1.2, ease: "easeInOut" }}
                      />
                      Subscribe now
                      <motion.div
                        animate={{ rotate: [0, 15, -15, 0], y: [0, -2, 2, 0] }}
                        transition={{ duration: 2, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }}
                      >
                        <Fingerprint className="size-4" />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            )}

            <Button
              variant="link"
              className="text-muted-foreground text-xs"
              onClick={() => {
                trackUpgrade.dismissed();
                setOpen(false);
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

function PriceTag({ price, discountedPrice }: { price: number; discountedPrice: number }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-muted/50 border border-border px-4 py-3">
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-bold tracking-tighter bg-linear-to-br from-zinc-900 to-zinc-600 bg-clip-text text-transparent dark:from-white dark:to-zinc-300">
          ${discountedPrice}
        </span>
        <span className="text-base line-through text-muted-foreground">${price}</span>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-500">
          50% off
        </span>
        <span className="text-xs text-muted-foreground">per month · cancel anytime</span>
      </div>
    </div>
  );
}

const features = [
  { icon: Zap, label: "Unlimited code exports", sub: "No daily limits, ever" },
  { icon: ImageIcon, label: "HD & Ultra HD quality", sub: "Up to 6× resolution" },
  { icon: Palette, label: "All premium themes & fonts", sub: "Exclusive editor styles" },
  { icon: Bookmark, label: "Unlimited saved snippets", sub: "Never lose your work" },
  { icon: Sparkles, label: "No watermark", sub: "Clean, professional exports" },
];

function ProFeatureList() {
  return (
    <ul className="space-y-1">
      {features.map((f, i) => (
        <motion.li
          key={f.label}
          className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/50"
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.04 * i, duration: 0.25 }}
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
            <f.icon className="size-3.5 text-amber-500" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-none">{f.label}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{f.sub}</p>
          </div>
          <Icon icon="solar:check-circle-bold" className="size-4 shrink-0 text-emerald-500" />
        </motion.li>
      ))}
    </ul>
  );
}
