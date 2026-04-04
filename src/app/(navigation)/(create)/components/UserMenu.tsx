"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import {
  Loader2,
  CreditCard,
  LogOut,
  Sparkles,
  Crown,
  User,
  ChevronRight,
  Zap,
} from "lucide-react";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/use-subscription";
import PlansDialog from "./PlansDialog";

/* ── Plan config ──────────────────────────────────────────────────── */

type PlanSlug = "free" | "pro" | "elite" | "ultimate";

const PLAN_CONFIG: Record<
  PlanSlug,
  {
    label: string;
    description: string;
    badge: string | null;
    badgeCls: string;
    ringCls: string;
    dotCls: string;
    cardCls: string;
    iconCls: string;
  }
> = {
  free: {
    label: "Free",
    description: "10 exports / month",
    badge: null,
    badgeCls: "",
    ringCls: "ring-border",
    dotCls: "",
    cardCls: "bg-muted/50 border-border/60",
    iconCls: "text-muted-foreground",
  },
  pro: {
    label: "Pro",
    description: "Unlimited exports · HD quality",
    badge: "Pro",
    badgeCls:
      "bg-violet-500/10 text-violet-400 ring-violet-500/25 dark:bg-violet-500/15",
    ringCls: "ring-violet-500/60",
    dotCls: "bg-violet-500",
    cardCls:
      "bg-linear-to-br from-violet-500/10 to-violet-500/5 border-violet-500/20",
    iconCls: "text-violet-400",
  },
  elite: {
    label: "Elite",
    description: "4K export · API access",
    badge: "Elite",
    badgeCls:
      "bg-amber-500/10 text-amber-400 ring-amber-500/25 dark:bg-amber-500/15",
    ringCls: "ring-amber-500/60",
    dotCls: "bg-amber-500",
    cardCls:
      "bg-linear-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20",
    iconCls: "text-amber-400",
  },
  ultimate: {
    label: "Ultimate",
    description: "All features · Priority support",
    badge: "Ultimate",
    badgeCls:
      "bg-rose-500/10 text-rose-400 ring-rose-500/25 dark:bg-rose-500/15",
    ringCls: "ring-rose-500/60",
    dotCls: "bg-rose-500",
    cardCls:
      "bg-linear-to-br from-rose-500/10 to-rose-500/5 border-rose-500/20",
    iconCls: "text-rose-400",
  },
};

/* ── Skeleton loader ──────────────────────────────────────────────── */

function AvatarSkeleton() {
  return (
    <div className="size-8 rounded-full bg-muted animate-pulse ring-2 ring-border" />
  );
}

/* ── Main component ───────────────────────────────────────────────── */

export default function UserMenu() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const { plan, isPro, isLoaded: subLoaded } = useSubscription();
  const router = useRouter();

  /* Loading */
  if (!isLoaded || !subLoaded) return <AvatarSkeleton />;

  /* Unauthenticated */
  if (!isSignedIn) return <PlansDialog />;

  const cfg = PLAN_CONFIG[plan as PlanSlug] ?? PLAN_CONFIG.free;
  const initials =
    ((user.firstName?.[0] ?? "") + (user.lastName?.[0] ?? "")).toUpperCase() ||
    "U";
  const displayName = user.fullName ?? user.username ?? "User";
  const email = user.primaryEmailAddress?.emailAddress ?? "";

  return (
    <DropdownMenu>
      {/* ── Trigger ───────────────────────────────────────────────── */}
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Open user menu"
          className={[
            "relative flex items-center rounded-full outline-none",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "transition-transform duration-150 active:scale-95",
          ].join(" ")}
        >
          <Avatar
            className={[
              "size-8 ring-2 transition-all duration-200",
              cfg.ringCls,
              "hover:scale-105 hover:shadow-lg",
            ].join(" ")}
          >
            <AvatarImage src={user.imageUrl} alt={displayName} />
            <AvatarFallback className="text-[10px] font-bold bg-linear-to-br from-muted to-muted/60">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* Plan dot badge on avatar */}
          {isPro && (
            <span
              className={[
                "absolute -bottom-0.5 -right-0.5 size-3 rounded-full ring-2 ring-background",
                "flex items-center justify-center",
                cfg.dotCls,
              ].join(" ")}
            >
              <Crown className="size-1.5 text-white" />
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      {/* ── Content ───────────────────────────────────────────────── */}
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-72 p-0 overflow-hidden shadow-2xl border-border/60 rounded-2xl"
      >
        {/* ── Header — identity ─────────────────────────────────── */}
        <div className="relative px-4 pt-4 pb-3">
          {/* Subtle gradient wash behind header */}
          <div
            className={[
              "absolute inset-0 opacity-30 pointer-events-none",
              isPro
                ? "bg-linear-to-br from-violet-500/20 via-transparent to-transparent"
                : "bg-linear-to-br from-muted/60 to-transparent",
            ].join(" ")}
          />

          <div className="relative flex items-center gap-3">
            <div className="relative shrink-0">
              <Avatar className={`size-11 ring-2 ${cfg.ringCls}`}>
                <AvatarImage src={user.imageUrl} alt={displayName} />
                <AvatarFallback className="text-xs font-bold bg-linear-to-br from-muted to-muted/80">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {isPro && (
                <span
                  className={[
                    "absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full",
                    "ring-2 ring-background flex items-center justify-center",
                    cfg.dotCls,
                  ].join(" ")}
                >
                  <Crown className="size-2 text-white" />
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold leading-tight">
                  {displayName}
                </p>
                {cfg.badge && (
                  <span
                    className={[
                      "shrink-0 inline-flex items-center rounded-full px-1.5 py-0.5",
                      "text-[9px] font-bold uppercase tracking-wider ring-1",
                      cfg.badgeCls,
                    ].join(" ")}
                  >
                    {cfg.badge}
                  </span>
                )}
              </div>
              <p className="truncate text-xs text-muted-foreground mt-0.5 leading-tight">
                {email}
              </p>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator className="mx-0 my-0" />

        {/* ── Plan card ─────────────────────────────────────────── */}
        <div className="px-3 py-2.5">
          <div
            className={[
              "flex items-center justify-between rounded-xl border px-3 py-2.5",
              "transition-colors duration-200",
              cfg.cardCls,
            ].join(" ")}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={[
                  "size-7 rounded-lg flex items-center justify-center",
                  isPro ? `bg-background/60` : "bg-muted",
                ].join(" ")}
              >
                {isPro ? (
                  <Crown className={`size-3.5 ${cfg.iconCls}`} />
                ) : (
                  <Zap className="size-3.5 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="text-[11px] font-semibold leading-none capitalize">
                  {cfg.label} Plan
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-none">
                  {cfg.description}
                </p>
              </div>
            </div>

            {/* Upgrade chip */}
            {!isPro && (
              <button
                onClick={() => router.push("/pricing")}
                className={[
                  "group flex items-center gap-0.5 rounded-full px-2 py-1",
                  "text-[9px] font-bold uppercase tracking-wider",
                  "bg-linear-to-r from-violet-500 to-violet-600 text-white",
                  "hover:from-violet-600 hover:to-violet-700 transition-all duration-200",
                  "shadow-sm shadow-violet-500/20",
                ].join(" ")}
              >
                <Sparkles className="size-2.5" />
                Upgrade
              </button>
            )}
          </div>
        </div>

        <DropdownMenuSeparator className="mx-0 my-0" />

        {/* ── Actions ───────────────────────────────────────────── */}
        <div className="px-1.5 py-1.5 space-y-0.5">
          {/* Profile */}
          <DropdownMenuGroup>
            <DropdownMenuItem
              onSelect={() => openUserProfile()}
              className="gap-3 rounded-lg px-2.5 py-2 cursor-pointer group"
            >
              <div className="size-6 rounded-md bg-muted flex items-center justify-center shrink-0 group-hover:bg-muted/80 transition-colors">
                <User className="size-3.5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-none">Profile</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Account settings & security
                </p>
              </div>
              <ChevronRight className="size-3 text-muted-foreground/50 shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </DropdownMenuItem>

            {/* Billing */}
            <DropdownMenuItem
              onSelect={() =>
                isPro
                  ? openUserProfile()
                  : router.push("/pricing")
              }
              className="gap-3 rounded-lg px-2.5 py-2 cursor-pointer group"
            >
              <div className="size-6 rounded-md bg-muted flex items-center justify-center shrink-0 group-hover:bg-muted/80 transition-colors">
                <CreditCard className="size-3.5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-none">Billing</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {isPro ? "Manage subscription" : "View plans & pricing"}
                </p>
              </div>
              <ChevronRight className="size-3 text-muted-foreground/50 shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="mx-1 my-1" />

          {/* Sign out */}
          <DropdownMenuGroup>
            <DropdownMenuItem
              onSelect={() => signOut({ redirectUrl: "/" })}
              variant="destructive"
              className="gap-3 rounded-lg px-2.5 py-2 cursor-pointer group"
            >
              <div className="size-6 rounded-md bg-destructive/10 flex items-center justify-center shrink-0 group-hover:bg-destructive/15 transition-colors">
                <LogOut className="size-3.5 text-destructive" />
              </div>
              <span className="text-sm font-medium">Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </div>

        {/* ── Footer — version / branding ───────────────────────── */}
        <div className="px-4 py-2 border-t border-border/40 bg-muted/20">
          <p className="text-[9px] text-muted-foreground/50 text-center tracking-wide uppercase font-medium">
            CuteCode · Beautiful code snippets
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
