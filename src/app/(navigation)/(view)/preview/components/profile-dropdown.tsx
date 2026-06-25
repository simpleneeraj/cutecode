"use client";

import * as React from "react";
import { cn } from "@/utils/cn";
import { useRouter } from "next/navigation";
import { useClerk, useUser } from "@/hooks/use-auth";
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
import { Icon } from "@/components/ui/icon";
import PremiumBadge from "./premium-badge";

const productId = process.env.NEXT_PUBLIC_DODO_PRODUCT_PRO;

interface ProfileDropdownProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function ProfileDropdown({ className, ...props }: ProfileDropdownProps) {
  const { user } = useUser();
  const { openBilling } = useBilling();
  const { isPro } = useSubscription();
  const { signOut, openUserProfile } = useClerk();

  const router = useRouter();
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
      .map((n: string) => n[0])
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
              "relative flex items-center justify-center rounded-full p-0 outline-none",
              isPro && "ring-2 ring-amber-500/40 ring-offset-1 ring-offset-background",
            )}
          >
            <Avatar>
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
            </Avatar>

            {isPro && (
              <span className="absolute -bottom-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full bg-foreground ring-2 ring-background">
                <Icon icon="solar:crown-bold" className="size-2.5 text-background" />
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" sideOffset={8} className="flex w-64 flex-col gap-1 p-1.5">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <Avatar className="size-9">
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{name}</p>
              <p className="truncate text-xs text-muted-foreground">{email}</p>
            </div>

            {isPro && <PremiumBadge />}
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuItem className="cursor-pointer gap-2.5 px-2 py-2" onClick={() => router.push("/dashboard")}>
            <Icon icon="solar:widget-2-linear" className="size-4" />
            Dashboard
          </DropdownMenuItem>

          {isPro && (
            <DropdownMenuItem className="cursor-pointer gap-2.5 px-2 py-2" onClick={() => openBilling(productId)}>
              <Icon icon="solar:card-linear" className="size-4" />
              Manage billing
            </DropdownMenuItem>
          )}

          <DropdownMenuItem className="cursor-pointer gap-2.5 px-2 py-2" onClick={() => openUserProfile()}>
            <Icon icon="solar:settings-minimalistic-linear" className="size-4" />
            Manage account
          </DropdownMenuItem>

          {!isPro && (
            <DropdownMenuItem className="cursor-pointer gap-2.5 px-2 py-2" onClick={() => setPlansOpen(true)}>
              <Icon icon="solar:crown-linear" className="size-4" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">Upgrade to Pro</span>
                <span className="text-xs text-muted-foreground">Unlock premium themes & fonts</span>
              </div>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem variant="destructive" className="cursor-pointer gap-2.5 px-2 py-2" onClick={onSignOut}>
            <Icon icon="solar:logout-3-linear" className="size-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
