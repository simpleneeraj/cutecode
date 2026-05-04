import "@/styles/globals.css";
import { Viewport } from "next";
import { BASE_URL } from "@/utils/common";
import { Toaster } from "@/components/toast";
import { Analytics } from "@vercel/analytics/next";
import { TooltipProvider } from "@/components/tooltip";
import { ClerkThemeProvider } from "@/components/clerk-theme-provider";
import { ThemeProvider } from "@/components/theme-switch/theme-provider";

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
    <ClerkThemeProvider>
      <html lang="en" suppressHydrationWarning>
        {/* <head>
          <Analytics />
        </head> */}
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
