"use client";

import * as React from "react";
import { cn } from "@/utils/cn";
import { LogOut, CreditCard, Settings } from "lucide-react";
import { useClerk, useUser } from "@clerk/nextjs";
import { useSetAtom } from "jotai";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSubscription } from "@/hooks/use-subscription";
import { resetEditorAtom } from "@/store/editor/editor/reset";
import { plansDialogOpenAtom } from "@/store/editor/plans";
import useBilling from "@/hooks/use-billing";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import PremiumBadge from "./premium-badge";

const productId = process.env.NEXT_PUBLIC_DODO_PRODUCT_PRO;

interface ProfileDropdownProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function ProfileDropdown({ className, ...props }: ProfileDropdownProps) {
  const { user } = useUser();
  const { openBilling } = useBilling();
  const { isPro } = useSubscription();
  const { signOut, openUserProfile } = useClerk();

  const resetEditor = useSetAtom(resetEditorAtom);
  const setPlansOpen = useSetAtom(plansDialogOpenAtom);

  const onSignOut = async () => {
    resetEditor();
    await signOut();
  };

  const { name, email, avatar, initials } = React.useMemo(() => {
    const name = user?.fullName ?? user?.username ?? "User";
    const email = user?.primaryEmailAddress?.emailAddress ?? "";
    const avatar = user?.imageUrl ?? "";
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    return { name, email, avatar, initials };
  }, [user]);

  return (
    <div className={cn("relative", className)} {...props}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            type="button"
            className={cn(
              "relative flex items-center justify-center rounded-full outline-none transition-all duration-200",
              isPro && "ring-2 ring-amber-500/40 ring-offset-1 ring-offset-background",
            )}
          >
            <Avatar>
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
            </Avatar>

            {isPro ? (
              <span className="absolute -bottom-1 -right-1 flex size-3 items-center justify-center rounded-full bg-linear-to-tr from-amber-400 to-orange-500 shadow ring-2 ring-background">
                <Icon icon="solar:crown-star-bold" className="size-2.5 text-white" />
              </span>
            ) : (
              <span className="absolute -bottom-1 -right-1 flex size-3 items-center justify-center rounded-full bg-muted shadow ring-2 ring-background">
                <Icon icon="solar:crown-bold" className="size-2.5 text-muted-foreground" />
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" sideOffset={8} className="w-64 p-2 rounded-2xl shadow-xl flex flex-col gap-1">
          <div
            className={cn(
              "flex items-center gap-3 px-3 py-2 mb-1 rounded-xl",
              isPro && "bg-linear-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/10",
            )}
          >
            <div className="relative shrink-0">
              <Avatar className="size-8">
                <AvatarImage src={avatar} alt={name} />
                <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium truncate">{name}</p>
              </div>
              <p className="text-xs text-muted-foreground truncate">{email}</p>
            </div>

            {isPro && <PremiumBadge />}
          </div>

          <DropdownMenuSeparator />
          {isPro && (
            <DropdownMenuItem
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer"
              onClick={() => openBilling(productId)}
            >
              <CreditCard className="size-4 text-muted-foreground" />
              <span className="text-sm">Manage billing</span>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer"
            onClick={() => openUserProfile()}
          >
            <Settings className="size-4 text-muted-foreground" />
            <span className="text-sm">Manage account</span>
          </DropdownMenuItem>
          {!isPro && (
            <DropdownMenuItem
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer bg-linear-to-r from-amber-500/5 to-orange-500/5 border border-amber-500/10 hover:from-amber-500/10 hover:to-orange-500/10"
              onClick={() => setPlansOpen(true)}
            >
              <Icon icon="solar:crown-star-bold" className="size-4 text-amber-500" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-amber-500">Upgrade to Pro</span>
                <span className="text-xxs text-muted-foreground">Unlock premium themes & fonts</span>
              </div>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {/* Sign out */}
          <DropdownMenuItem
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-500/10"
            onClick={onSignOut}
          >
            <LogOut className="size-4 text-red-500" />
            <span className="text-sm font-medium">Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
