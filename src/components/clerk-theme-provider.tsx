"use client";

import { useTheme } from "next-themes";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/ui/themes";

/**
 * Wraps ClerkProvider with the shadcn theme from @clerk/ui/themes.
 *
 * The shadcn theme automatically adapts to light/dark mode via the CSS
 * color-scheme property set in globals.css (.dark { color-scheme: dark }).
 * No manual baseTheme swapping is needed.
 */
export function ClerkThemeProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();

  return (
    <ClerkProvider
      appearance={{
        theme: dark,
      }}
    >
      {children}
    </ClerkProvider>
  );
}
