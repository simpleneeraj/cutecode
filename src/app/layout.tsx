import "@/styles/globals.css";
import type { Metadata, Viewport } from "next";
import { BASE_URL } from "@/utils/common";
import { Toaster } from "@/components/toast";
import { TooltipProvider } from "@/components/tooltip";
import { ClerkThemeProvider } from "@/components/clerk-theme-provider";
import { ThemeProvider } from "@/components/theme-switch/theme-provider";
import JsonLd from "@/components/seo/json-ld";

const title = "CuteCode — Free Code Screenshot & Image Generator Tool";
const description =
  "Turn code into stunning screenshots in seconds. Custom themes, 100+ languages, HD export. The best free ray.so & carbon alternative for developers.";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  // ── Title template: child pages get " | CuteCode" appended automatically
  title: {
    default: title,
    template: "%s | CuteCode",
  },

  description,

  // ── Canonical & robots
  alternates: {
    canonical: BASE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // ── Keywords (Google doesn't weight these heavily, but Bing & others do)
  keywords: [
    "code screenshot tool",
    "code image generator",
    "beautiful code screenshots",
    "ray.so alternative",
    "carbon alternative",
    "chalk.ist alternative",
    "code snippet to image",
    "syntax highlighting screenshot",
    "developer tools",
    "code export tool",
    "share code as image",
    "online code editor screenshot",
  ],

  // ── Open Graph (shared links on Slack, Twitter, LinkedIn, etc.)
  openGraph: {
    type: "website",
    url: BASE_URL,
    siteName: "CuteCode",
    title,
    description,
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "CuteCode — Beautiful Code Screenshots",
      },
    ],
    locale: "en_US",
  },

  // ── Twitter / X card
  twitter: {
    card: "summary_large_image",
    site: "@cutecodeapp",
    creator: "@cutecodeapp",
    title,
    description,
    images: [`${BASE_URL}/og-image.png`],
  },

  // ── App metadata
  applicationName: "CuteCode",
  category: "Developer Tools",
  creator: "CuteCode",
  publisher: "CuteCode",

  // ── Verification (add your tokens here once you verify ownership)
  // verification: {
  //   google: "YOUR_GOOGLE_SEARCH_CONSOLE_TOKEN",
  //   yandex: "YOUR_YANDEX_TOKEN",
  //   bing: "YOUR_BING_WEBMASTER_TOKEN",
  // },
};

export const viewport: Viewport = {
  themeColor: "#181818",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkThemeProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          {/* JSON-LD structured data — parsed by Google before JavaScript runs */}
          <JsonLd />
        </head>
        <body className="relative">
          <ThemeProvider>
            <TooltipProvider>
              <div className="isolate relative flex flex-col">{children}</div>
              <Toaster position="top-center" offset={70} duration={2000} />
            </TooltipProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkThemeProvider>
  );
}
