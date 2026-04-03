import Link from "next/link";
import { PLANS } from "@/lib/billing/plans";
import { Plan } from "@/generated/prisma/client";

export const metadata = {
  title: "Pricing — CuteCode",
  description: "Simple, transparent pricing for everyone.",
};

const PLAN_KEYS = [Plan.FREE, Plan.PRO, Plan.ELITE, Plan.ULTIMATE] as const;

const PLAN_PRODUCT_IDS: Record<Plan, string | undefined> = {
  [Plan.FREE]: undefined,
  [Plan.PRO]: process.env.NEXT_PUBLIC_DODO_PRODUCT_PRO,
  [Plan.ELITE]: process.env.NEXT_PUBLIC_DODO_PRODUCT_ELITE,
  [Plan.ULTIMATE]: process.env.NEXT_PUBLIC_DODO_PRODUCT_ULTIMATE,
};

const PLAN_FEATURES: Record<Plan, string[]> = {
  [Plan.FREE]: [
    "10 exports / month",
    "Basic themes",
    "Standard quality",
    "5 saved snippets",
  ],
  [Plan.PRO]: [
    "Unlimited exports",
    "All premium themes",
    "HD export",
    "Watermark removal",
    "Unlimited saved snippets",
  ],
  [Plan.ELITE]: [
    "Everything in Pro",
    "4K export",
    "API access",
    "Priority support",
  ],
  [Plan.ULTIMATE]: [
    "Everything in Elite",
    "Team collaboration",
    "Custom branding",
    "Dedicated support",
  ],
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#0e0e0e] py-24 text-white">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-16 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Simple pricing</h1>
          <p className="mt-4 text-gray-400">
            Start free. Upgrade when you need more.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PLAN_KEYS.map((key) => {
            const plan = PLANS[key];
            const productId = PLAN_PRODUCT_IDS[key];
            const isPaid = key !== Plan.FREE;

            return (
              <div
                key={key}
                className={`flex flex-col rounded-2xl border p-6 ${
                  key === Plan.PRO
                    ? "border-white/30 bg-white/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <div className="mb-6">
                  <p className="text-sm font-semibold uppercase tracking-widest text-gray-400">
                    {plan.name}
                  </p>
                  <p className="mt-2 text-4xl font-bold">
                    {plan.price === 0 ? "Free" : `$${plan.price}`}
                    {plan.price > 0 && (
                      <span className="text-lg font-normal text-gray-400">/mo</span>
                    )}
                  </p>
                </div>

                <ul className="mb-8 flex-1 space-y-3">
                  {PLAN_FEATURES[key].map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <span className="text-green-400">✓</span>
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {isPaid && productId ? (
                  <a
                    href={`/api/checkout?productId=${productId}`}
                    className="block w-full rounded-lg bg-white py-2.5 text-center font-semibold text-black transition hover:bg-gray-200"
                  >
                    Get {plan.name}
                  </a>
                ) : isPaid ? (
                  <span className="block w-full rounded-lg bg-white/10 py-2.5 text-center text-sm text-gray-500">
                    Coming soon
                  </span>
                ) : (
                  <Link
                    href="/sign-up"
                    className="block w-full rounded-lg border border-white/20 py-2.5 text-center font-semibold text-white transition hover:bg-white/10"
                  >
                    Get started free
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
