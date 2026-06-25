import "@/styles/globals.css";

import { Geist, Geist_Mono } from "next/font/google";
import { BASE_URL } from "@/utils/common";
import { Toaster } from "@/components/toast";
import JsonLd from "@/components/seo/json-ld";
import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { TooltipProvider } from "@/components/tooltip";
import { ThemeProvider } from "@/components/theme-switch/theme-provider";
import { headingFontVariable } from "@/fonts/global";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

const title = "CuteCode — Create beautiful images of your code";
const description =
  "Create beautiful code screenshots in seconds. Pick a theme, export HD images, share instantly. Best alternative to ray.so and Carbon for developers.";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: title,
    template: "%s | CuteCode",
  },
  description,
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
        alt: "CuteCode — Create beautiful images of your code",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: "@iamsimpleneeraj",
    creator: "@iamsimpleneeraj",
    title,
    description,
    images: [`${BASE_URL}/og-image.png`],
  },
  applicationName: "CuteCode",
  category: "Developer Tools",
  creator: "CuteCode",
  publisher: "CuteCode",
};

export const viewport: Viewport = {
  themeColor: "#181818",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${headingFontVariable}`}
    >
      <head>
        <JsonLd />
      </head>
      <body className="relative">
        <ThemeProvider>
          <TooltipProvider>
            <div className="isolate relative flex flex-col">{children}</div>
            <Toaster position="top-center" offset={70} duration={2000} />
            {process.env.NODE_ENV === "production" && <Analytics />}
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
