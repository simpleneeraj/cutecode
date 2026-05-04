"use client";

import { UserButton } from "@clerk/nextjs";
import useBilling from "@/hooks/use-billing";
import { HugeiconsIcon } from "@hugeicons/react";
import { useSubscription } from "@/hooks/use-subscription";
import { Crown03Icon, CreditCard } from "@hugeicons/core-free-icons";

const productId = process.env.NEXT_PUBLIC_DODO_PRODUCT_PRO;

export default function UserMenu() {
  const { isPro, plan } = useSubscription();
  const { openBilling } = useBilling();

  return (
    <div className="relative flex flex-col items-center">
      <UserButton
        appearance={{
          elements: {
            avatarBox: `w-10 h-10 transition ${
              isPro
                ? "ring-2 ring-violet-500/50 hover:ring-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.5)]"
                : "ring-2 ring-white/10 hover:ring-white/20"
            }`,
            userButtonPopoverCard: "bg-neutral-900 border border-white/10 shadow-xl rounded-xl",
            userButtonPopoverActionButton: "hover:bg-white/5 transition rounded-md px-2 py-2",
          },
        }}
      >
        {isPro ? (
          <UserButton.MenuItems>
            <UserButton.Action
              label={`Current Plan: ${plan || "Pro"}`}
              labelIcon={<HugeiconsIcon icon={Crown03Icon} className="size-4 text-violet-500" />}
              onClick={() => {}}
            />
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

      {/* Premium Badge */}
      {isPro && (
        <div className="absolute -bottom-1.5 -right-1 flex items-center justify-center p-0.5">
          <div className="flex items-center justify-center w-3 h-3 rounded-full bg-linear-to-tr from-violet-600 to-purple-400 shadow-md ring-2 ring-neutral-900">
            <HugeiconsIcon icon={Crown03Icon} className="size-1.5 text-white" />
          </div>
        </div>
      )}
    </div>
  );
}
