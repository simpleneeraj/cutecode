"use client";

import { UserButton } from "@clerk/nextjs";
import useBilling from "@/hooks/use-billing";
import { HugeiconsIcon } from "@hugeicons/react";
import { useSubscription } from "@/hooks/use-subscription";
import { Crown03Icon, CreditCard } from "@hugeicons/core-free-icons";

const productId = process.env.NEXT_PUBLIC_DODO_PRODUCT_PRO;

export default function UserMenu() {
  const { isPro } = useSubscription();
  const { openBilling } = useBilling();

  return (
    <UserButton>
      {isPro ? (
        <UserButton.MenuItems>
          <UserButton.Action
            label="Manage billing"
            labelIcon={<HugeiconsIcon icon={CreditCard} className="size-4" />}
            onClick={() => openBilling(productId)}
          />
          <UserButton.Action label="manageAccount" />
          <UserButton.Action label="signOut" />
        </UserButton.MenuItems>
      ) : (
        <UserButton.MenuItems>
          <UserButton.Action
            label="Upgrade to Pro"
            labelIcon={<HugeiconsIcon icon={Crown03Icon} className="size-4 text-violet-500" />}
            onClick={() => openBilling(productId)}
          />
          <UserButton.Action label="manageAccount" />
          <UserButton.Action label="signOut" />
        </UserButton.MenuItems>
      )}
    </UserButton>
  );
}
