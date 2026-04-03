import { Log } from "./log";
import "@/app/styles/globals.css";
import { Viewport } from "next";
import { BASE_URL } from "@/utils/common";
import { Toaster } from "@/components/toast";
import { Analytics } from "@vercel/analytics/react";
import { TooltipProvider } from "@/components/tooltip";
import { ThemeProvider } from "@/components/theme-switch/theme-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { ClerkThemeProvider } from "@/components/clerk-theme-provider";

const title = "CuteCode — Beautiful Code Snippets";
const description = "Create and export stunning, beautifully styled code snippets in seconds.";

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: title,
  description: description,
  openGraph: {
    type: "website",
    siteName: "CuteCode",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@cutecode",
  },
};

export const viewport: Viewport = {
  themeColor: "#181818",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      unsafe_disableDevelopmentModeConsoleWarning
      appearance={{
        layout: {
          unsafe_disableDevelopmentModeWarnings: true,
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          <Analytics />
        </head>
        <body className="relative">
          <ThemeProvider>
            <ClerkThemeProvider>
              <TooltipProvider>
                <Log />
                <div className="isolate relative flex flex-col">{children}</div>
                <Toaster position="top-center" offset={70} duration={2000} />
              </TooltipProvider>
            </ClerkThemeProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
