"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { Check, Minus, Crown, Sparkles, Rocket, Star, ArrowRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Crown03Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { Dialog, DialogPopup, DialogTrigger } from "@/components/ui/dialog";
import { useSubscription } from "@/hooks/use-subscription";

/* ── Plan definitions ─────────────────────────────────────────────── */

const PLANS = [
  {
    key: "pro",
    name: "Pro",
    price: 5,
    icon: Sparkles,
    description: "Perfect for individual creators",
    popular: true,
    color: {
      accent: "violet",
      bg: "from-violet-500/10 via-violet-500/5 to-transparent",
      border: "border-violet-500/40",
      badge: "bg-violet-500 text-white",
      button: "from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 shadow-violet-500/25",
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
    icon: Crown,
    description: "For power users & professionals",
    popular: false,
    color: {
      accent: "amber",
      bg: "from-amber-500/10 via-amber-500/5 to-transparent",
      border: "border-amber-500/40",
      badge: "bg-amber-500 text-white",
      button: "from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 shadow-amber-500/25",
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
    icon: Rocket,
    description: "Maximum power, zero limits",
    popular: false,
    color: {
      accent: "rose",
      bg: "from-rose-500/10 via-rose-500/5 to-transparent",
      border: "border-rose-500/40",
      badge: "bg-rose-500 text-white",
      button: "from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 shadow-rose-500/25",
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
  tooltip?: string;
  pro: string | boolean;
  elite: string | boolean;
  ultimate: string | boolean;
}[] = [
  { label: "Exports / month", pro: "Unlimited", elite: "Unlimited", ultimate: "Unlimited" },
  { label: "Export quality", pro: "HD (2x)", elite: "4K (4x)", ultimate: "4K (4x)" },
  { label: "Premium themes", pro: true, elite: true, ultimate: true },
  { label: "Watermark removal", pro: true, elite: true, ultimate: true },
  { label: "Saved snippets", pro: "Unlimited", elite: "Unlimited", ultimate: "Unlimited" },
  { label: "API access", pro: false, elite: true, ultimate: true },
  { label: "Priority support", pro: false, elite: true, ultimate: true },
  { label: "Team collaboration", pro: false, elite: false, ultimate: true },
  { label: "Custom branding", pro: false, elite: false, ultimate: true },
  { label: "Dedicated support", pro: false, elite: false, ultimate: true },
];

/* ── Sub-components ───────────────────────────────────────────────── */

function FeatureValue({ value, checkCls }: { value: string | boolean; checkCls: string }) {
  if (value === false) return <Minus className="size-3.5 text-muted-foreground/40 mx-auto" />;
  if (value === true) return <Check className={`size-3.5 mx-auto ${checkCls}`} />;
  return <span className={`text-xxs font-semibold ${checkCls}`}>{value}</span>;
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
              className={["size-4 transition-colors", selected ? plan.color.check : "text-muted-foreground"].join(" ")}
            />
          </div>
          <div>
            <p className="text-sm font-bold leading-none">{plan.name}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 leading-none">{plan.description}</p>
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
          selected ? `border-transparent ${plan.color.dot} shadow-sm` : "border-border",
        ].join(" ")}
      >
        {selected && <Check className="size-3" />}
      </div>
    </button>
  );
}

/* ── Main component ───────────────────────────────────────────────── */

export default function PlansDialog() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const { openSignIn } = useClerk();
  const { plan, isPro, isLoaded: subLoaded } = useSubscription();
  const [selected, setSelected] = useState<PlanKey>("pro");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const selectedPlan = PLANS.find((p) => p.key === selected)!;

  // Already paid → show badge button
  if (isLoaded && isPro) {
    return (
      <Button variant="outline" size="sm" onClick={() => router.push("/pricing")} className="gap-1.5">
        <HugeiconsIcon icon={Crown03Icon} className="size-4 text-amber-500" />
        <span className="capitalize">{plan}</span> Plan
      </Button>
    );
  }

  async function handleCTA() {
    if (!isSignedIn) {
      openSignIn({ forceRedirectUrl: "/pricing" });
      return;
    }
    setLoading(true);
    // Navigate to pricing — Clerk PricingTable handles checkout
    router.push("/pricing");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />} className="gap-1.5">
        <HugeiconsIcon icon={Crown03Icon} />
        Upgrade to Pro
      </DialogTrigger>

      <DialogPopup className="sm:max-w-3xl rounded-2xl p-0 gap-0 relative">
        {/* ── Modal header ────────────────────────────────────────── */}
        <div className="absolute inset-0 bg-linear-to-br from-violet-500/8 via-transparent to-amber-500/5 pointer-events-none" />
        <div className="relative px-6 pt-6 pb-4">
          {/* Background shimmer */}
          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <Star className="size-4 text-amber-400 fill-amber-400" />
              <span className="text-xxs font-bold uppercase tracking-widest text-muted-foreground">Go Premium</span>
            </div>
            <h2 className="text-xl font-black tracking-tight">Unlock your full potential</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Beautiful code exports, HD quality, and no limits — cancel anytime.
            </p>
          </div>
        </div>

        <div className="px-6 pb-6 space-y-5">
          {/* ── Plan selector ─────────────────────────────────────── */}
          <div className="grid grid-cols-3 gap-3">
            {PLANS.map((p) => (
              <PlanCard key={p.key} plan={p} selected={selected === p.key} onSelect={() => setSelected(p.key)} />
            ))}
          </div>

          {/* ── Feature comparison table ───────────────────────────── */}
          <div className="rounded-2xl border border-border/60 overflow-hidden bg-muted/20">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_repeat(3,5rem)] px-4 py-2.5 bg-muted/40 border-b border-border/50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Feature</span>
              {PLANS.map((p) => (
                <span
                  key={p.key}
                  className={[
                    "text-[10px] font-bold uppercase tracking-wider text-center transition-colors",
                    selected === p.key ? p.color.check : "text-muted-foreground",
                  ].join(" ")}
                >
                  {p.name}
                </span>
              ))}
            </div>

            {/* Feature rows */}
            {FEATURES.map((feature, i) => (
              <div
                key={feature.label}
                className={[
                  "grid grid-cols-[1fr_repeat(3,5rem)] px-4 py-2 items-center",
                  "border-b border-border/30 last:border-0",
                  i % 2 === 0 ? "bg-transparent" : "bg-muted/10",
                ].join(" ")}
              >
                <span className="text-xxs font-medium text-foreground/80">{feature.label}</span>
                <div className="text-center">
                  <FeatureValue value={feature.pro} checkCls={PLANS[0].color.check} />
                </div>
                <div className="text-center">
                  <FeatureValue value={feature.elite} checkCls={PLANS[1].color.check} />
                </div>
                <div className="text-center">
                  <FeatureValue value={feature.ultimate} checkCls={PLANS[2].color.check} />
                </div>
              </div>
            ))}
          </div>

          {/* ── CTA footer ────────────────────────────────────────── */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground">
                Starting at <span className="font-bold text-foreground">${selectedPlan.price}/month</span> · Cancel
                anytime · No contracts
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setOpen(false)}>
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
                    disabled={loading}
                    onClick={handleCTA}
                    className={[
                      "relative inline-flex items-center gap-2 rounded-xl px-5 py-2.5",
                      "text-sm font-bold text-white shadow-lg transition-all duration-200",
                      "bg-linear-to-r disabled:opacity-60 disabled:cursor-not-allowed",
                      "overflow-hidden group",
                      selectedPlan.color.button,
                    ].join(" ")}
                  >
                    {/* Shimmer */}
                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-linear-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

                    {loading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <>
                        {!isSignedIn ? "Sign in to upgrade" : `Get ${selectedPlan.name}`}
                        <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </DialogPopup>
    </Dialog>
  );
}
