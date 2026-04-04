"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, useClerk, ClerkLoaded, Show } from "@clerk/nextjs";
import {
  CheckoutProvider,
  useCheckout,
  PaymentElementProvider,
  PaymentElement,
  usePaymentElement,
} from "@clerk/nextjs/experimental";
import {
  Check,
  Minus,
  Crown,
  Sparkles,
  Rocket,
  Star,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Crown03Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { Dialog, DialogPopup, DialogTrigger } from "@/components/ui/dialog";
import { useSubscription } from "@/hooks/use-subscription";

/* ── Plan definitions ─────────────────────────────────────────────── */
// Plan IDs must match slugs from Clerk Dashboard → Billing → Plans
// Replace the planId values with your actual Clerk plan IDs from:
// https://dashboard.clerk.com/~/billing/plans

const PLANS = [
  {
    key: "pro",
    name: "Pro",
    price: 5,
    planId: process.env.NEXT_PUBLIC_CLERK_PLAN_ID_PRO ?? "",
    planPeriod: "month" as const,
    icon: Sparkles,
    description: "Perfect for individual creators",
    popular: true,
    color: {
      accent: "violet",
      bg: "from-violet-500/10 via-violet-500/5 to-transparent",
      border: "border-violet-500/40",
      badge: "bg-violet-500 text-white",
      button:
        "from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 shadow-violet-500/25",
      check: "text-violet-400",
      glow: "shadow-violet-500/20",
      ring: "ring-violet-500/30",
      dot: "bg-violet-500",
    },
  },
  {
    key: "elite",
    name: "Elite",
    price: 12,
    planId: process.env.NEXT_PUBLIC_CLERK_PLAN_ID_ELITE ?? "",
    planPeriod: "month" as const,
    icon: Crown,
    description: "For power users & professionals",
    popular: false,
    color: {
      accent: "amber",
      bg: "from-amber-500/10 via-amber-500/5 to-transparent",
      border: "border-amber-500/40",
      badge: "bg-amber-500 text-white",
      button:
        "from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 shadow-amber-500/25",
      check: "text-amber-400",
      glow: "shadow-amber-500/20",
      ring: "ring-amber-500/30",
      dot: "bg-amber-500",
    },
  },
  {
    key: "ultimate",
    name: "Ultimate",
    price: 25,
    planId: process.env.NEXT_PUBLIC_CLERK_PLAN_ID_ULTIMATE ?? "",
    planPeriod: "month" as const,
    icon: Rocket,
    description: "Maximum power, zero limits",
    popular: false,
    color: {
      accent: "rose",
      bg: "from-rose-500/10 via-rose-500/5 to-transparent",
      border: "border-rose-500/40",
      badge: "bg-rose-500 text-white",
      button:
        "from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 shadow-rose-500/25",
      check: "text-rose-400",
      glow: "shadow-rose-500/20",
      ring: "ring-rose-500/30",
      dot: "bg-rose-500",
    },
  },
] as const;

type PlanKey = (typeof PLANS)[number]["key"];

const FEATURES: {
  label: string;
  pro: string | boolean;
  elite: string | boolean;
  ultimate: string | boolean;
}[] = [
  {
    label: "Exports / month",
    pro: "Unlimited",
    elite: "Unlimited",
    ultimate: "Unlimited",
  },
  {
    label: "Export quality",
    pro: "HD (2x)",
    elite: "4K (4x)",
    ultimate: "4K (4x)",
  },
  { label: "Premium themes", pro: true, elite: true, ultimate: true },
  { label: "Watermark removal", pro: true, elite: true, ultimate: true },
  {
    label: "Saved snippets",
    pro: "Unlimited",
    elite: "Unlimited",
    ultimate: "Unlimited",
  },
  { label: "API access", pro: false, elite: true, ultimate: true },
  { label: "Priority support", pro: false, elite: true, ultimate: true },
  { label: "Team collaboration", pro: false, elite: false, ultimate: true },
  { label: "Custom branding", pro: false, elite: false, ultimate: true },
  { label: "Dedicated support", pro: false, elite: false, ultimate: true },
];

/* ── Helpers ──────────────────────────────────────────────────────── */

function FeatureValue({
  value,
  checkCls,
}: {
  value: string | boolean;
  checkCls: string;
}) {
  if (value === false)
    return <Minus className="size-3.5 text-muted-foreground/40 mx-auto" />;
  if (value === true)
    return <Check className={`size-3.5 mx-auto ${checkCls}`} />;
  return (
    <span className={`text-xxs font-semibold ${checkCls}`}>{value}</span>
  );
}

function PlanCard({
  plan,
  selected,
  onSelect,
}: {
  plan: (typeof PLANS)[number];
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = plan.icon;
  return (
    <button
      onClick={onSelect}
      className={[
        "relative w-full text-left rounded-2xl border px-4 py-6 transition-all duration-200 outline-none",
        "hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring",
        selected
          ? `bg-linear-to-b ${plan.color.bg} ${plan.color.border} shadow-lg ${plan.color.glow} ring-1 ${plan.color.ring}`
          : "bg-muted/30 border-border/60 hover:border-border",
      ].join(" ")}
    >
      {plan.popular && (
        <span
          className={[
            "absolute -top-2.5 left-1/2 -translate-x-1/2",
            "px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider",
            plan.color.badge,
          ].join(" ")}
        >
          Most Popular
        </span>
      )}

      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className={[
              "size-8 rounded-xl flex items-center justify-center shrink-0",
              selected ? `bg-${plan.color.accent}-500/15` : "bg-muted",
            ].join(" ")}
          >
            <Icon
              className={[
                "size-4 transition-colors",
                selected ? plan.color.check : "text-muted-foreground",
              ].join(" ")}
            />
          </div>
          <div>
            <p className="text-sm font-bold leading-none">{plan.name}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 leading-none">
              {plan.description}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-lg font-black leading-none">${plan.price}</span>
          <span className="text-xxs text-muted-foreground font-normal">/mo</span>
        </div>
      </div>

      {/* Selection indicator */}
      <div
        className={[
          "absolute top-3 right-3 size-4 rounded-full border-2 transition-all flex items-center justify-center",
          selected
            ? `border-transparent ${plan.color.dot} shadow-sm`
            : "border-border",
        ].join(" ")}
      >
        {selected && <Check className="size-3 text-white" />}
      </div>
    </button>
  );
}

/* ── Checkout: Payment form (Step 2) ──────────────────────────────── */

function PaymentSection({
  plan,
  onBack,
  onSuccess,
}: {
  plan: (typeof PLANS)[number];
  onBack: () => void;
  onSuccess: () => void;
}) {
  const { checkout, errors, fetchStatus } = useCheckout();
  const { isFormReady, submit } = usePaymentElement();
  const [isProcessing, setIsProcessing] = useState(false);
  const [globalErrors, setGlobalErrors] = useState<string[]>([]);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFormReady || isProcessing || fetchStatus === "fetching") return;

    setIsProcessing(true);
    setGlobalErrors([]);

    try {
      const { data, error } = await submit();
      if (error) {
        setGlobalErrors([error.error.message ?? error.error.code ?? "Payment validation failed"]);
        return;
      }

      const { error: confirmError } = await checkout.confirm(data);
      if (confirmError) {
        setGlobalErrors([confirmError.message ?? confirmError.code ?? "Payment confirmation failed"]);
        return;
      }

      await checkout.finalize({
        navigate: ({ decorateUrl }) => {
          const url = decorateUrl("/");
          onSuccess();
          if (url.startsWith("http")) {
            window.location.href = url;
          } else {
            router.push(url);
          }
        },
      });
    } catch (err) {
      setGlobalErrors(["An unexpected error occurred. Please try again."]);
    } finally {
      setIsProcessing(false);
    }
  };

  const isSubmitting = isProcessing || fetchStatus === "fetching";
  const needsInit = checkout.status === "needs_initialization";

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-5"
    >
      {/* Order summary */}
      <div
        className={[
          "rounded-2xl border p-4 bg-linear-to-b",
          plan.color.bg,
          plan.color.border,
        ].join(" ")}
      >
        <p className="text-xxs font-bold uppercase tracking-wider text-muted-foreground mb-2">
          Order summary
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <plan.icon className={`size-4 ${plan.color.check}`} />
            <span className="text-sm font-bold">{plan.name} Plan</span>
          </div>
          <div className="text-right">
            <span className="text-base font-black">${plan.price}</span>
            <span className="text-xxs text-muted-foreground">/month</span>
          </div>
        </div>
        {checkout.totals && (
          <div className="mt-2 pt-2 border-t border-border/40 flex justify-between text-xxs text-muted-foreground">
            <span>Due today</span>
            <span className="font-semibold text-foreground">
              {checkout.totals.totalDueNow.currencySymbol}
              {checkout.totals.totalDueNow.amountFormatted}
            </span>
          </div>
        )}
      </div>

      {/* Init state */}
      {needsInit && (
        <div className="flex flex-col items-center gap-3 py-4">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Preparing your checkout...
          </p>
          <Button
            size="sm"
            onClick={() => checkout.start()}
            disabled={fetchStatus === "fetching"}
          >
            {fetchStatus === "fetching" ? "Initializing..." : "Start Checkout"}
          </Button>
        </div>
      )}

      {/* Payment form */}
      {!needsInit && (
        <PaymentElementProvider checkout={checkout}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-xl border border-border/60 p-4 bg-muted/10">
              <PaymentElement
                fallback={
                  <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    Loading payment form...
                  </div>
                }
              />
            </div>

            {/* Errors */}
            {(globalErrors.length > 0 ||
              (errors.global && errors.global.length > 0)) && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2">
                {(
                  globalErrors.length > 0
                    ? globalErrors
                    : errors.global?.map(
                        (e) => e.longMessage || e.message
                      ) ?? []
                ).map((msg, i) => (
                  <p key={i} className="text-xs text-destructive">
                    {msg}
                  </p>
                ))}
              </div>
            )}

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-4 text-xxs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Lock className="size-3" /> SSL Encrypted
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="size-3" /> Cancel anytime
              </span>
            </div>

            {/* CTA */}
            <button
              type="submit"
              disabled={!isFormReady || isSubmitting}
              className={[
                "relative w-full inline-flex items-center justify-center gap-2",
                "rounded-xl px-5 py-3 text-sm font-bold text-white",
                "bg-linear-to-r transition-all duration-200 shadow-lg",
                "disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden group",
                plan.color.button,
              ].join(" ")}
            >
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-linear-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Complete Purchase — ${plan.price}/mo
                  <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>
        </PaymentElementProvider>
      )}
    </motion.div>
  );
}

function CheckoutStep({
  plan,
  onBack,
  onSuccess,
}: {
  plan: (typeof PLANS)[number];
  onBack: () => void;
  onSuccess: () => void;
}) {
  return (
    <CheckoutProvider
      for="user"
      planId={plan.planId}
      planPeriod={plan.planPeriod}
    >
      <ClerkLoaded>
        <Show when="signed-in">
          <PaymentSection plan={plan} onBack={onBack} onSuccess={onSuccess} />
        </Show>
      </ClerkLoaded>
    </CheckoutProvider>
  );
}

/* ── Main component ───────────────────────────────────────────────── */

export default function PlansDialog() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const { openSignIn } = useClerk();
  const { plan, isPro, isLoaded: subLoaded } = useSubscription();
  const [selected, setSelected] = useState<PlanKey>("pro");
  const [step, setStep] = useState<"select" | "checkout">("select");
  const [open, setOpen] = useState(false);

  const selectedPlan = PLANS.find((p) => p.key === selected)!;

  // Already paid → manage plan
  if (isLoaded && isPro) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push("/pricing")}
        className="gap-1.5"
      >
        <HugeiconsIcon icon={Crown03Icon} className="size-4 text-amber-500" />
        <span className="capitalize">{plan}</span> Plan
      </Button>
    );
  }

  function handleCTA() {
    if (!isSignedIn) {
      // Store selected plan in URL so after sign-in we can auto-checkout
      openSignIn({
        forceRedirectUrl: `/pricing?plan=${selected}`,
      });
      return;
    }
    setStep("checkout");
  }

  function handleClose() {
    setOpen(false);
    // Reset with a slight delay so the animation plays out
    setTimeout(() => setStep("select"), 300);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
      <DialogTrigger render={<Button />} className="gap-1.5">
        <HugeiconsIcon icon={Crown03Icon} />
        Upgrade to Pro
      </DialogTrigger>

      <DialogPopup className="sm:max-w-3xl rounded-2xl p-0 gap-0 relative overflow-hidden">
        {/* Gradient wash */}
        <div className="absolute inset-0 bg-linear-to-br from-violet-500/8 via-transparent to-amber-500/5 pointer-events-none" />

        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 flex items-start gap-3">
          {step === "checkout" && (
            <button
              onClick={() => setStep("select")}
              className="mt-1 shrink-0 size-7 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              <ArrowLeft className="size-4" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Star className="size-4 text-amber-400 fill-amber-400" />
              <span className="text-xxs font-bold uppercase tracking-widest text-muted-foreground">
                {step === "select" ? "Go Premium" : `${selectedPlan.name} Plan`}
              </span>
            </div>
            <h2 className="text-xl font-black tracking-tight">
              {step === "select"
                ? "Unlock your full potential"
                : "Complete your purchase"}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {step === "select"
                ? "Beautiful code exports, HD quality, and no limits — cancel anytime."
                : `You're subscribing to ${selectedPlan.name} at $${selectedPlan.price}/month. Cancel anytime.`}
            </p>
          </div>
        </div>

        <div className="relative px-6 pb-6 space-y-5">
          <AnimatePresence mode="wait">
            {step === "select" ? (
              <motion.div
                key="select"
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {/* Plan cards */}
                <div className="grid grid-cols-3 gap-3">
                  {PLANS.map((p) => (
                    <PlanCard
                      key={p.key}
                      plan={p}
                      selected={selected === p.key}
                      onSelect={() => setSelected(p.key)}
                    />
                  ))}
                </div>

                {/* Feature table */}
                <div className="rounded-2xl border border-border/60 overflow-hidden bg-muted/20">
                  <div className="grid grid-cols-[1fr_repeat(3,5rem)] px-4 py-2.5 bg-muted/40 border-b border-border/50">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Feature
                    </span>
                    {PLANS.map((p) => (
                      <span
                        key={p.key}
                        className={[
                          "text-[10px] font-bold uppercase tracking-wider text-center transition-colors",
                          selected === p.key
                            ? p.color.check
                            : "text-muted-foreground",
                        ].join(" ")}
                      >
                        {p.name}
                      </span>
                    ))}
                  </div>
                  {FEATURES.map((feature, i) => (
                    <div
                      key={feature.label}
                      className={[
                        "grid grid-cols-[1fr_repeat(3,5rem)] px-4 py-2 items-center",
                        "border-b border-border/30 last:border-0",
                        i % 2 === 0 ? "bg-transparent" : "bg-muted/10",
                      ].join(" ")}
                    >
                      <span className="text-xxs font-medium text-foreground/80">
                        {feature.label}
                      </span>
                      <div className="text-center">
                        <FeatureValue
                          value={feature.pro}
                          checkCls={PLANS[0].color.check}
                        />
                      </div>
                      <div className="text-center">
                        <FeatureValue
                          value={feature.elite}
                          checkCls={PLANS[1].color.check}
                        />
                      </div>
                      <div className="text-center">
                        <FeatureValue
                          value={feature.ultimate}
                          checkCls={PLANS[2].color.check}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTA row */}
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs text-muted-foreground">
                    Starting at{" "}
                    <span className="font-bold text-foreground">
                      ${selectedPlan.price}/month
                    </span>{" "}
                    · Cancel anytime · No contracts
                  </p>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground"
                      onClick={handleClose}
                    >
                      Maybe later
                    </Button>

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={selected}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                      >
                        <button
                          onClick={handleCTA}
                          className={[
                            "relative inline-flex items-center gap-2 rounded-xl px-5 py-2.5",
                            "text-sm font-bold text-white shadow-lg transition-all duration-200",
                            "bg-linear-to-r overflow-hidden group",
                            selectedPlan.color.button,
                          ].join(" ")}
                        >
                          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-linear-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
                          {!isSignedIn
                            ? "Sign in & subscribe"
                            : `Get ${selectedPlan.name}`}
                          <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            ) : (
              <CheckoutStep
                key="checkout"
                plan={selectedPlan}
                onBack={() => setStep("select")}
                onSuccess={handleClose}
              />
            )}
          </AnimatePresence>
        </div>
      </DialogPopup>
    </Dialog>
  );
}
