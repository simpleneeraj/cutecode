import React from "react";
import { Icon } from "@/components/ui/icon";

const PremiumBadge: React.FC = () => {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-md border bg-muted px-1.5 py-0.5 text-xs font-semibold tracking-wide text-foreground">
      <Icon icon="solar:crown-bold" className="size-3" />
      Pro
    </span>
  );
};

export default PremiumBadge;
