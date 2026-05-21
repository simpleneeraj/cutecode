import type { Metadata } from "next";
import PageClient from "./page.client";
import { BASE_URL } from "@/utils/common";

const title = "Create beautiful images of your code";
const description =
  "Turn your code snippets into beautiful, shareable visuals for social media, documentation, blogs, and presentations.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: BASE_URL,
  },
  keywords: [
    "code screenshot tool",
    "code image generator",
    "code snippet to image",
    "syntax highlighting screenshot",
    "ray.so alternative",
    "carbon alternative",
    "beautiful code screenshots",
    "share code as image",
    "code screenshot for twitter",
    "developer screenshot tool",
    "code to png",
    "code image for readme",
  ],
};

export default function Page() {
  return <PageClient />;
}
