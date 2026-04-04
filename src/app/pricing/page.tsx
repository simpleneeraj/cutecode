import { PricingTable } from "@clerk/nextjs";

export const metadata = {
  title: "Pricing — CuteCode",
  description: "Simple, transparent pricing for everyone.",
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#0e0e0e] py-24 text-white">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-16 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Simple pricing</h1>
          <p className="mt-4 text-gray-400">
            Start free. Upgrade when you need more.
          </p>
        </div>

        {/* Clerk Billing renders your plans from the Clerk Dashboard */}
        <PricingTable />
      </div>
    </main>
  );
}
