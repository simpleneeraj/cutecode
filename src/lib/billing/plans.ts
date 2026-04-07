import { Plan } from "@/generated/prisma/enums";

export const PLANS = {
  FREE: {
    name: "Free",
    monthlyExports: 10,
    premiumThemes: false,
    hdExport: false,
    export4k: false,
    watermarkRemoval: false,
    savedSnippets: 5,
    apiAccess: false,
    price: 0,
  },
  PRO: {
    name: "Pro",
    monthlyExports: Infinity,
    premiumThemes: true,
    hdExport: true,
    export4k: false,
    watermarkRemoval: true,
    savedSnippets: Infinity,
    apiAccess: false,
    price: 5,
  },
  ELITE: {
    name: "Elite",
    monthlyExports: Infinity,
    premiumThemes: true,
    hdExport: true,
    export4k: true,
    watermarkRemoval: true,
    savedSnippets: Infinity,
    apiAccess: true,
    price: 12,
  },
  ULTIMATE: {
    name: "Ultimate",
    monthlyExports: Infinity,
    premiumThemes: true,
    hdExport: true,
    export4k: true,
    watermarkRemoval: true,
    savedSnippets: Infinity,
    apiAccess: true,
    price: 25,
  },
} as const satisfies Record<
  Plan,
  {
    name: string;
    monthlyExports: number;
    premiumThemes: boolean;
    hdExport: boolean;
    export4k: boolean;
    watermarkRemoval: boolean;
    savedSnippets: number;
    apiAccess: boolean;
    price: number;
  }
>;

export type PlanKey = keyof typeof PLANS;
export type PlanFeature = keyof (typeof PLANS)[PlanKey];

export function getPlanLimits(plan: Plan) {
  return PLANS[plan];
}

/** Returns true if the plan includes the given feature */
export function canUseFeature(plan: Plan, feature: PlanFeature): boolean {
  const limits = PLANS[plan];
  const value = limits[feature];
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value > 0;
  return false;
}

/** Numeric rank of each plan — higher is better */
export const PLAN_ORDER: Record<Plan, number> = {
  FREE: 0,
  PRO: 1,
  ELITE: 2,
  ULTIMATE: 3,
};

/** Returns true if userPlan is at least as good as requiredPlan */
export function isPlanAtLeast(userPlan: Plan, requiredPlan: Plan): boolean {
  return PLAN_ORDER[userPlan] >= PLAN_ORDER[requiredPlan];
}
