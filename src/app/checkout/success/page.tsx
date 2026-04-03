import Link from "next/link";

export const metadata = {
  title: "Payment Successful — CuteCode",
};

export default function CheckoutSuccessPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#111] text-white">
      <div className="text-5xl">🎉</div>
      <h1 className="text-3xl font-bold">You&apos;re all set!</h1>
      <p className="text-gray-400">
        Your subscription is now active. Enjoy your premium features.
      </p>
      <Link
        href="/"
        className="mt-4 rounded-lg bg-white px-6 py-3 font-semibold text-black transition hover:bg-gray-200"
      >
        Start creating
      </Link>
    </div>
  );
}
