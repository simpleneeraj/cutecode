import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your CuteCode account to create and share beautiful code screenshots.",
};

// Reads search params (redirectedFrom) on the client — render dynamically.
export const dynamic = "force-dynamic";

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return children;
}
