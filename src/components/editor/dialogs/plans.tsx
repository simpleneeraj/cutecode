"use client";

import { useUser } from "@/hooks/use-auth";
import { Link } from "@/components/link";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
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
import { Crown, CrownStar, Box, CheckCircle } from "@solar-icons/react";
import { PLANS, PLAN_ORDER, type PlanKey, type PlanFeature } from "@/lib/billing/plans";
import useBilling from "@/hooks/use-billing";
import { Plan } from "@/generated/prisma/enums";
import { getRedirectUrlWithParam } from "@/utils/url";
import { useSubscription } from "@/hooks/use-subscription";
import { plansDialogOpenAtom } from "@/store/editor/plans";
import { trackUpgrade } from "@/lib/analytics";

const PRO_PRODUCT_ID = process.env.NEXT_PUBLIC_DODO_PRODUCT_PRO;
const PREMIUM_PRODUCT_ID = process.env.NEXT_PUBLIC_DODO_PRODUCT_PREMIUM;

const PRODUCT_ID: Partial<Record<PlanKey, string | undefined>> = {
  PRO: PRO_PRODUCT_ID,
  PREMIUM: PREMIUM_PRODUCT_ID,
};

// Per-tier icon. Mixed duotone: bold-duotone for the paid accent marks.
const TIER_ICON = {
  FREE: <Box weight="LineDuotone" className="size-4" aria-hidden="true" />,
  PRO: <Crown weight="BoldDuotone" className="size-4" aria-hidden="true" />,
  PREMIUM: <CrownStar weight="BoldDuotone" className="size-4" aria-hidden="true" />,
} satisfies Record<PlanKey, React.ReactNode>;

// Feature list is derived from the PLANS limits so the UI can never drift from data.
const FEATURE_ROWS: { key: PlanFeature; label: (v: number | boolean | string) => string | null }[] = [
  { key: "monthlyExports", label: (v) => (v === Infinity ? "Unlimited exports" : `${v} exports / month`) },
  { key: "savedSnippets", label: (v) => (v === Infinity ? "Unlimited saved snippets" : `${v} saved snippets`) },
  { key: "premiumThemes", label: (v) => (v ? "All premium themes & fonts" : null) },
  { key: "hdExport", label: (v) => (v ? "HD image export" : null) },
  { key: "export4k", label: (v) => (v ? "4K / Ultra HD export" : null) },
  { key: "watermarkRemoval", label: (v) => (v ? "No watermark" : null) },
  { key: "apiAccess", label: (v) => (v ? "API access" : null) },
];

function planFeatures(key: PlanKey): string[] {
  const limits = PLANS[key];
  return FEATURE_ROWS.map((r) => r.label(limits[r.key])).filter((l): l is string => l !== null);
}

const TIERS: PlanKey[] = [Plan.FREE, Plan.PRO, Plan.PREMIUM];

interface Props {
  trigger?: React.ReactNode;
}

export default function PlansDialog({ trigger }: Props) {
  const { isSignedIn, isLoaded } = useUser();
  const { plan: currentPlan, isLoaded: subLoaded } = useSubscription();
  const { openBilling, isLoading } = useBilling();
  const [open, setOpen] = useAtom(plansDialogOpenAtom);

  const loading = !isLoaded || !subLoaded || isLoading;

  async function onUpgrade(tier: PlanKey) {
    trackUpgrade.ctaClicked(true);
    await openBilling(PRODUCT_ID[tier]);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger}
      <DialogPopup className="overflow-hidden rounded-2xl sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5 text-xl">
            <span className="flex size-8 items-center justify-center rounded-xl bg-foreground text-background">
              <Crown weight="BoldDuotone" className="size-4" aria-hidden="true" />
            </span>
            Choose your plan
          </DialogTitle>
          <DialogDescription>
            Export high-quality code images without limits. Upgrade or downgrade anytime.
          </DialogDescription>
        </DialogHeader>

        <DialogPanel>
          <div className="grid gap-3 sm:grid-cols-3">
            {TIERS.map((tier) => (
              <PlanCard
                key={tier}
                tier={tier}
                currentPlan={currentPlan}
                isSignedIn={!!isSignedIn}
                loading={loading}
                onUpgrade={onUpgrade}
              />
            ))}
          </div>
        </DialogPanel>

        <DialogFooter className="sm:justify-center">
          <p className="text-center text-xs text-muted-foreground">
            Secure checkout · Cancel anytime · Instant access
          </p>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}

function PlanCard({
  tier,
  currentPlan,
  isSignedIn,
  loading,
  onUpgrade,
}: {
  tier: PlanKey;
  currentPlan: Plan;
  isSignedIn: boolean;
  loading: boolean;
  onUpgrade: (tier: PlanKey) => void;
}) {
  const meta = PLANS[tier];
  const features = planFeatures(tier);

  const isPopular = tier === Plan.PRO;
  const isCurrent = currentPlan === tier;
  const isDowngrade = PLAN_ORDER[currentPlan] > PLAN_ORDER[tier];
  const isPaid = meta.price > 0;
  const productMissing = isPaid && !PRODUCT_ID[tier];

  return (
    <div
      className={cn(
        "relative flex flex-col gap-4 rounded-xl border bg-card p-4",
        isPopular && "border-foreground/30 shadow-sm",
      )}
    >
      {isPopular && (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-2.5 py-0.5 text-[11px] font-semibold text-background">
          Most popular
        </span>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
            {TIER_ICON[tier]}
          </span>
          <span className="text-sm font-semibold text-foreground">{meta.name}</span>
        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold tracking-tighter text-foreground">${meta.price}</span>
          <span className="text-xs text-muted-foreground">{isPaid ? "/ month" : "forever"}</span>
        </div>
      </div>

      <ul className="flex flex-1 flex-col gap-2">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-xs">
            <CheckCircle weight="BoldDuotone" className="mt-px size-3.5 shrink-0 text-foreground" aria-hidden="true" />
            <span className="text-muted-foreground">{f}</span>
          </li>
        ))}
      </ul>

      <PlanCta
        tier={tier}
        isCurrent={isCurrent}
        isDowngrade={isDowngrade}
        isPaid={isPaid}
        isPopular={isPopular}
        isSignedIn={isSignedIn}
        loading={loading}
        productMissing={productMissing}
        onUpgrade={onUpgrade}
      />
    </div>
  );
}

function PlanCta({
  tier,
  isCurrent,
  isDowngrade,
  isPaid,
  isPopular,
  isSignedIn,
  loading,
  productMissing,
  onUpgrade,
}: {
  tier: PlanKey;
  isCurrent: boolean;
  isDowngrade: boolean;
  isPaid: boolean;
  isPopular: boolean;
  isSignedIn: boolean;
  loading: boolean;
  productMissing: boolean;
  onUpgrade: (tier: PlanKey) => void;
}) {
  const variant = isPopular ? "default" : "outline";

  if (isCurrent) {
    return (
      <Button variant="outline" className="w-full" disabled>
        Current plan
      </Button>
    );
  }

  // Free tier (or any lower-than-current tier): nothing to buy.
  if (!isPaid || isDowngrade) {
    return (
      <Button variant="outline" className="w-full" disabled>
        {isDowngrade ? "Included" : "Free forever"}
      </Button>
    );
  }

  if (productMissing) {
    return (
      <Button variant="outline" className="w-full" disabled>
        Coming soon
      </Button>
    );
  }

  if (!isSignedIn) {
    return (
      <Button
        variant={variant}
        className="w-full"
        onClick={() => trackUpgrade.ctaClicked(false)}
        render={
          <Link
            href={`/account/sign-in?redirectedFrom=${encodeURIComponent(getRedirectUrlWithParam("upgrade", "true"))}`}
          />
        }
      >
        Sign in to upgrade
      </Button>
    );
  }

  return (
    <Button variant={variant} className="w-full" disabled={loading} onClick={() => onUpgrade(tier)}>
      {loading ? (
        <>
          <Spinner />
          Processing…
        </>
      ) : (
        "Upgrade"
      )}
    </Button>
  );
}
