"use client";

import { useTheme } from "next-themes";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export function ClerkThemeProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();

  return (
    <ClerkProvider
      appearance={{
        baseTheme: resolvedTheme === "dark" ? dark : undefined,
        variables: {
          // Shared tokens that look right in both light & dark
          borderRadius: "0.625rem",
          fontFamily: "inherit",
          fontSize: "0.875rem",
        },
        elements: {
          // Card — match popover/bg surface
          card: "shadow-xl border border-border bg-background",
          cardBox: "shadow-none",
          // Header
          headerTitle: "text-foreground",
          headerSubtitle: "text-muted-foreground",
          // Form fields
          formFieldLabel: "text-sm text-foreground",
          formFieldInput:
            "bg-background border-border text-foreground placeholder:text-muted-foreground focus:ring-ring",
          formFieldInputShowPasswordButton: "text-muted-foreground hover:text-foreground",
          // Buttons
          formButtonPrimary:
            "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
          footerActionLink: "text-primary hover:text-primary/80",
          // Social buttons
          socialButtonsBlockButton:
            "border-border bg-background text-foreground hover:bg-muted",
          socialButtonsBlockButtonText: "text-foreground font-medium",
          // Divider
          dividerLine: "bg-border",
          dividerText: "text-muted-foreground",
          // Internal nav links
          identityPreviewText: "text-foreground",
          identityPreviewEditButtonIcon: "text-muted-foreground",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
