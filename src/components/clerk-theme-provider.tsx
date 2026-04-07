"use client";

import { useTheme } from "next-themes";
import { ClerkProvider } from "@clerk/nextjs";

export function ClerkThemeProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme: theme } = useTheme();

  return (
    <ClerkProvider
      unsafe_disableDevelopmentModeConsoleWarning
      appearance={{
        theme,
        unsafe_disableDevelopmentModeWarnings: true,
      }}
    >
      {children}
    </ClerkProvider>
  );
}
