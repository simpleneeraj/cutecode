import type { Metadata } from "next";

import PageClient from "./page.client";

const SITE_URL = "https://www.cutecode.app";
const OG_IMAGE = `${SITE_URL}/og-image.png`;

// ── H1 copy: "Free Code Screenshot Tool — Create Beautiful Code Images"
// Keep in sync with the heading on PageClient if you have one
const title = "Free Code Screenshot Tool — Create Beautiful Code Images";
const description =
  "CuteCode is a free online code screenshot tool. Paste your code, pick a theme, and export a stunning image in seconds. The best ray.so & carbon alternative.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: SITE_URL,
  },
  keywords: [
    "code screenshot tool",
    "code image generator",
    "beautiful code screenshots",
    "ray.so alternative",
    "carbon alternative",
    "code snippet to image",
    "syntax highlighting screenshot",
  ],
  openGraph: {
    url: SITE_URL,
    title,
    description,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "CuteCode — Free Code Screenshot Tool",
      },
    ],
  },
  twitter: {
    title,
    description,
    images: [OG_IMAGE],
  },
};

export default function Page() {
  return <PageClient />;
}
