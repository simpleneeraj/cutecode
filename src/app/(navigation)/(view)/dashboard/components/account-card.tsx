"use client";

import { useSetAtom } from "jotai";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { PLANS } from "@/lib/billing/plans";
import useBilling from "@/hooks/use-billing";
import { plansDialogOpenAtom } from "@/store/editor/plans";
import { FREE_DAILY_PUBLISH_LIMIT } from "@/lib/billing/constants";

const PRO_PRODUCT_ID = process.env.NEXT_PUBLIC_DODO_PRODUCT_PRO;

type AccountCardProps = {
  plan: keyof typeof PLANS;
  renewsAt: string | null;
  cancelAtPeriodEnd: boolean;
  totalSnippets: number;
};

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(iso));
}

export function AccountCard({ plan, renewsAt, cancelAtPeriodEnd, totalSnippets }: AccountCardProps) {
  const { openBilling, isLoading } = useBilling();
  const setPlansOpen = useSetAtom(plansDialogOpenAtom);

  const isFree = plan === "FREE";
  const planMeta = PLANS[plan];

  return (
    <Card className="flex h-fit flex-col gap-5 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Account</h2>
        <Badge variant={isFree ? "outline" : "secondary"} className="gap-1">
          <Icon icon="solar:crown-bold" className="size-3" />
          {planMeta.name}
        </Badge>
      </div>

      <dl className="flex flex-col gap-3 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Plan</dt>
          <dd className="font-medium text-foreground">
            {planMeta.name}
            {planMeta.price > 0 ? ` · $${planMeta.price}/mo` : ""}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Snippets</dt>
          <dd className="font-medium text-foreground tabular-nums">{totalSnippets}</dd>
        </div>
        {isFree ? (
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Daily publishes</dt>
            <dd className="font-medium text-foreground">{FREE_DAILY_PUBLISH_LIMIT}/day</dd>
          </div>
        ) : (
          renewsAt && (
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">{cancelAtPeriodEnd ? "Ends" : "Renews"}</dt>
              <dd className="font-medium text-foreground">{formatDate(renewsAt)}</dd>
            </div>
          )
        )}
      </dl>

      {isFree ? (
        <Button size="lg" className="w-full" onClick={() => setPlansOpen(true)}>
          <Icon icon="solar:crown-linear" className="size-4" />
          Upgrade to Pro
        </Button>
      ) : (
        <Button
          variant="outline"
          size="lg"
          className="w-full"
          disabled={isLoading}
          onClick={() => openBilling(PRO_PRODUCT_ID)}
        >
          <Icon icon="solar:card-linear" className="size-4" />
          Manage billing
        </Button>
      )}
    </Card>
  );
}
