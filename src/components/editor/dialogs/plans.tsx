"use client";

import { useUser } from "@/hooks/use-auth";
import Link from "next/link";
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
import { Icon } from "@/components/ui/icon";
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
      <DialogPopup className="sm:max-w-md overflow-hidden rounded-2xl">
        <DialogHeader className="relative">
          <DialogTitle className="flex items-center gap-2.5 text-xl">
            <span className="flex size-8 items-center justify-center rounded-xl bg-foreground text-background">
              <Icon icon="solar:crown-bold" className="size-4" />
            </span>
            Upgrade to Pro
          </DialogTitle>
          <DialogDescription>
            Unlock premium features and export high-quality code images without limits.
          </DialogDescription>
        </DialogHeader>

        <DialogPanel className="relative space-y-5">
          <PriceTag price={proPlan.price * 2} discountedPrice={proPlan.price} />
          <div className="h-px bg-border" />
          <ProFeatureList />
        </DialogPanel>

        <DialogFooter className="flex-1 relative">
          <div className="flex-1 flex flex-col gap-2">
            {!isSignedIn ? (
              <Button
                type="button"
                size="lg"
                onClick={() => trackUpgrade.ctaClicked(false)}
                className="w-full"
                render={
                  <Link
                    href={`/account/sign-in?redirectedFrom=${encodeURIComponent(getRedirectUrlWithParam("upgrade", "true"))}`}
                  />
                }
              >
                Sign in to upgrade
              </Button>
            ) : (
              <Button type="button" size="lg" disabled={loading} onClick={onUpgradePlan} className="w-full">
                {loading ? (
                  <>
                    <Spinner />
                    Processing…
                  </>
                ) : (
                  "Subscribe now"
                )}
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
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-muted/50 px-4 py-3">
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-bold tracking-tighter text-foreground">${discountedPrice}</span>
        <span className="text-base text-muted-foreground line-through">${price}</span>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="rounded-full bg-foreground px-2 py-0.5 text-xs font-semibold text-background">50% off</span>
        <span className="text-xs text-muted-foreground">per month · cancel anytime</span>
      </div>
    </div>
  );
}

const features = [
  { icon: "solar:bolt-bold", label: "Unlimited code exports", sub: "No daily limits, ever" },
  { icon: "solar:gallery-bold", label: "HD & Ultra HD quality", sub: "Up to 6× resolution" },
  { icon: "solar:palette-bold", label: "All premium themes & fonts", sub: "Exclusive editor styles" },
  { icon: "solar:bookmark-bold", label: "Unlimited saved snippets", sub: "Never lose your work" },
  { icon: "solar:magic-stick-3-bold", label: "No watermark", sub: "Clean, professional exports" },
];

function ProFeatureList() {
  return (
    <ul className="space-y-1">
      {features.map((f) => (
        <li key={f.label} className="flex items-center gap-3 rounded-lg px-2 py-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Icon icon={f.icon} className="size-3.5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium leading-none text-foreground">{f.label}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{f.sub}</p>
          </div>
          <Icon icon="solar:check-circle-bold" className="size-4 shrink-0 text-foreground" />
        </li>
      ))}
    </ul>
  );
}
