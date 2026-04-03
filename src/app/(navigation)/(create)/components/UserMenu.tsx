"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { Loader2, CreditCard, LogOut, Settings, Sparkles, Crown } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Crown03Icon } from "@hugeicons/core-free-icons";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/use-subscription";
import { Plan } from "@/generated/prisma/enums";
import { PLANS } from "@/lib/billing/plans";
import PlansDialog from "./PlansDialog";

const PLAN_BADGE: Record<Plan, { label: string; className: string } | null> = {
  [Plan.FREE]: null,
  [Plan.PRO]: { label: "Pro", className: "bg-violet-500/15 text-violet-400 ring-violet-500/30" },
  [Plan.ELITE]: { label: "Elite", className: "bg-amber-500/15 text-amber-400 ring-amber-500/30" },
  [Plan.ULTIMATE]: { label: "Ultimate", className: "bg-rose-500/15 text-rose-400 ring-rose-500/30" },
};

export default function UserMenu() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const { plan, isPro, isLoaded: subLoaded } = useSubscription();
  const router = useRouter();
  const [portalLoading, setPortalLoading] = React.useState(false);

  if (!isLoaded || !subLoaded) {
    return (
      <Button variant="ghost" size="icon" className="size-8 rounded-full" disabled>
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
      </Button>
    );
  }

  // Not signed in → show the PlansDialog (which handles sign-in CTA internally)
  if (!isSignedIn) {
    return <PlansDialog />;
  }

  const initials = (user.firstName?.[0] ?? "") + (user.lastName?.[0] ?? "");
  const planInfo = PLANS[plan];
  const badge = PLAN_BADGE[plan];

  async function openPortal() {
    try {
      setPortalLoading(true);
      const res = await fetch("/api/customer-portal");
      const { customer_portal_url } = await res.json();
      window.location.href = customer_portal_url ?? "/pricing";
    } finally {
      setPortalLoading(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="relative flex items-center gap-1.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="User menu"
        >
          <Avatar className="size-8 ring-2 ring-border hover:ring-primary/50 transition-all">
            <AvatarImage src={user.imageUrl} alt={user.fullName ?? "User"} />
            <AvatarFallback className="text-[10px] font-semibold uppercase">
              {initials || "U"}
            </AvatarFallback>
          </Avatar>
          {/* Plan indicator dot */}
          {isPro && (
            <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-violet-500 ring-2 ring-background flex items-center justify-center">
              <Crown className="size-2 text-white" />
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64" sideOffset={8}>
        {/* User identity */}
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar className="size-9 ring-2 ring-border">
            <AvatarImage src={user.imageUrl} alt={user.fullName ?? "User"} />
            <AvatarFallback className="text-xs font-semibold uppercase">{initials || "U"}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-tight">
              {user.fullName ?? user.username ?? "User"}
            </p>
            <p className="truncate text-xs text-muted-foreground leading-tight mt-0.5">
              {user.primaryEmailAddress?.emailAddress}
            </p>
          </div>
          {badge && (
            <span
              className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${badge.className}`}
            >
              {badge.label}
            </span>
          )}
        </div>

        <DropdownMenuSeparator />

        {/* Plan section */}
        <div className="px-2 py-2 space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1">
            Current plan
          </p>
          <div className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={Crown03Icon} className="size-4 text-amber-500" />
              <div>
                <p className="text-sm font-medium leading-none">{planInfo.name}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {isPro ? "All features unlocked" : `${planInfo.monthlyExports} exports/month`}
                </p>
              </div>
            </div>
            {!isPro && (
              <span className="text-[10px] font-semibold text-muted-foreground">Free</span>
            )}
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {isPro ? (
            <DropdownMenuItem
              onSelect={openPortal}
              disabled={portalLoading}
              className="gap-2"
            >
              {portalLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CreditCard className="size-4" />
              )}
              Manage billing
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onSelect={() => router.push("/pricing")}
              className="gap-2 text-violet-500 focus:text-violet-500 focus:bg-violet-500/10"
            >
              <Sparkles className="size-4" />
              Upgrade to Pro
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem
            onSelect={() => signOut({ redirectUrl: "/" })}
            variant="destructive"
            className="gap-2"
          >
            <LogOut className="size-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
