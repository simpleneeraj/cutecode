import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your free CuteCode account and start creating beautiful code screenshots in seconds.",
};

// Reads search params (redirectedFrom) on the client — render dynamically.
export const dynamic = "force-dynamic";

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
