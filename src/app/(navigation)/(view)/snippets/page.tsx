import { Metadata } from "next";
import { BASE_URL } from "@/utils/common";
import SnippetsPageClient from "./page.client";

export const metadata: Metadata = {
  title: "My Snippets",
  description:
    "Save, manage, and share your code screenshots in one place. Access your CuteCode snippets anytime, from any device.",
  alternates: {
    canonical: `${BASE_URL}/snippets`,
  },
  robots: {
    index: false,
    follow: false,
  },
};
export default function SnippetsPage() {
  return <SnippetsPageClient />;
}
