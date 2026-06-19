import type { Metadata } from "next";
import ExplorePageClient from "./page.client";

export const metadata: Metadata = {
  title: "Explore Code Snippets — CuteCode",
  description:
    "Browse beautiful code screenshots created by the CuteCode community. Discover stunning code images across Python, TypeScript, Rust, Go, and more.",
  robots: { index: true, follow: true },
};

export default function ExplorePage() {
  return <ExplorePageClient />;
}
