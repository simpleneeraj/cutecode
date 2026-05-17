import React from "react";
import { cn } from "@/utils/cn";
import { Icon } from "@iconify/react";
import { useSubscription } from "@/hooks/use-subscription";

type PremiumBadgeProps = {};

const PremiumBadge: React.FC<PremiumBadgeProps> = () => {
  const { isPro } = useSubscription();
  return (
    <span
      className={cn(
        "shrink-0 inline-flex items-center gap-1",
        "text-xs font-semibold tracking-wide",
        "px-1.5 py-0.5 rounded-md",
        "",
        isPro
          ? "text-primary bg-primary/10 border border-primary/20"
          : "text-amber-400 bg-amber-500/10 border border-amber-500/20",
      )}
    >
      <Icon
        icon="solar:crown-star-bold"
        className={cn("size-3 text-amber-400", isPro ? "text-primary" : "text-amber-400")}
      />
      Pro
    </span>
  );
};

export default PremiumBadge;
