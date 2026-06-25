import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-background">
      {/* One subtle radial accent — no gradient mesh. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(60%_100%_at_50%_0%,--alpha(var(--color-primary)/8%),transparent)]"
      />

      <div className="relative z-10 flex w-full max-w-[400px] flex-col items-center px-4 py-8">
        {/* Logo */}
        <Link
          href="/"
          className="mb-8 flex items-center gap-2.5 font-semibold tracking-tight text-foreground transition-opacity hover:opacity-80"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background">
            <svg viewBox="0 0 24 24" fill="none" className="size-4.5" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 9L11 12L8 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13 15H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <span className="text-xl">CuteCode</span>
        </Link>

        {children}

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-muted-foreground">
          By continuing, you agree to CuteCode&apos;s{" "}
          <Link href="/legal/terms" className="underline underline-offset-2 hover:text-foreground">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/legal/privacy" className="underline underline-offset-2 hover:text-foreground">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
