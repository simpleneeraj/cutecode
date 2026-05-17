/**
 * @file analytics/index.ts
 * @description Enterprise-grade analytics utility for CuteCode.
 *
 * Wraps `@vercel/analytics` `track()` with:
 *  - Fully typed event names and payloads via discriminated-union contract.
 *  - Zero-throw guarantee – tracking errors are silenced to never impact UX.
 *  - Consistent property snake_case convention across all events.
 *  - Tree-shakeable: each domain exports its own `track*` helper.
 *
 * Reference: https://vercel.com/docs/analytics/custom-events
 */

import { track as vercelTrack } from "@vercel/analytics";

// ─── Event Contract ───────────────────────────────────────────────────────────

/**
 * Canonical set of analytics events emitted by the app.
 * Event names follow `domain:action` convention for easy dashboard grouping.
 */
export type AnalyticsEvent =
  // ── Navigation ─────────────────────────────────────────────────────────────
  | {
      name: "navigation:tab_changed";
      payload: { tab: "Create" | "Explore" | "Snippets" };
    }

  // ── Export ──────────────────────────────────────────────────────────────────
  | { name: "export:png_saved"; payload: { file_name: string; export_size: number } }
  | { name: "export:png_copied"; payload: { export_size: number } }
  | { name: "export:svg_saved"; payload: { file_name: string } }
  | { name: "export:size_changed"; payload: { export_size: number; is_premium: boolean } }

  // ── Publish / Snippet ────────────────────────────────────────────────────────
  | {
      name: "snippet:published";
      payload: { visibility: "PUBLIC" | "PASSCODE" | "PRIVATE"; has_description: boolean };
    }
  | { name: "snippet:publish_dialog_opened"; payload: Record<string, never> }

  // ── Upgrade / Billing ────────────────────────────────────────────────────────
  | { name: "upgrade:dialog_opened"; payload: { source: string } }
  | { name: "upgrade:cta_clicked"; payload: { is_signed_in: boolean } }
  | { name: "upgrade:dismissed"; payload: Record<string, never> }

  // ── Auth ────────────────────────────────────────────────────────────────────
  | { name: "auth:sign_in_clicked"; payload: { source: string } }

  // ── Editor Controls ─────────────────────────────────────────────────────────
  | { name: "editor:theme_changed"; payload: { theme_id: string; is_premium: boolean } }
  | { name: "editor:font_changed"; payload: { font_id: string; is_premium: boolean } }
  | { name: "editor:language_changed"; payload: { language: string } }
  | { name: "editor:padding_changed"; payload: { padding: number } }
  | { name: "editor:background_image_set"; payload: Record<string, never> }

  // ── Premium Gate ────────────────────────────────────────────────────────────
  | {
      name: "premium_gate:triggered";
      payload: { feature: string; access_level: string };
    };

// ─── Core Track Wrapper ───────────────────────────────────────────────────────

/**
 * Type-safe, zero-throw wrapper around `@vercel/analytics` `track()`.
 *
 * @example
 * trackEvent({ name: "export:png_saved", payload: { file_name: "my-snippet", export_size: 2 } });
 */
export function trackEvent<E extends AnalyticsEvent>(event: E): void {
  try {
    vercelTrack(event.name, event.payload as Record<string, string | number | boolean>);
  } catch {
    // Analytics must never break the application.
    if (process.env.NODE_ENV === "development") {
      console.warn("[analytics] track() threw unexpectedly:", event.name);
    }
  }
}

// ─── Domain Helpers ───────────────────────────────────────────────────────────
// These thin wrappers improve call-site ergonomics and provide a stable API
// surface that can evolve independently of the raw event contract.

/** Track navigation events (header tab changes). */
export const trackNavigation = {
  tabChanged: (tab: "Create" | "Explore" | "Snippets") =>
    trackEvent({ name: "navigation:tab_changed", payload: { tab } }),
};

/** Track export-related events. */
export const trackExport = {
  pngSaved: (fileName: string, exportSize: number) =>
    trackEvent({ name: "export:png_saved", payload: { file_name: fileName, export_size: exportSize } }),

  pngCopied: (exportSize: number) =>
    trackEvent({ name: "export:png_copied", payload: { export_size: exportSize } }),

  svgSaved: (fileName: string) =>
    trackEvent({ name: "export:svg_saved", payload: { file_name: fileName } }),

  sizeChanged: (exportSize: number, isPremium: boolean) =>
    trackEvent({ name: "export:size_changed", payload: { export_size: exportSize, is_premium: isPremium } }),
};

/** Track snippet publish events. */
export const trackSnippet = {
  publishDialogOpened: () =>
    trackEvent({ name: "snippet:publish_dialog_opened", payload: {} }),

  published: (visibility: "PUBLIC" | "PASSCODE" | "PRIVATE", hasDescription: boolean) =>
    trackEvent({ name: "snippet:published", payload: { visibility, has_description: hasDescription } }),
};

/** Track upgrade / billing funnel events. */
export const trackUpgrade = {
  dialogOpened: (source: string) =>
    trackEvent({ name: "upgrade:dialog_opened", payload: { source } }),

  ctaClicked: (isSignedIn: boolean) =>
    trackEvent({ name: "upgrade:cta_clicked", payload: { is_signed_in: isSignedIn } }),

  dismissed: () =>
    trackEvent({ name: "upgrade:dismissed", payload: {} }),
};

/** Track auth events. */
export const trackAuth = {
  signInClicked: (source: string) =>
    trackEvent({ name: "auth:sign_in_clicked", payload: { source } }),
};

/** Track editor control interactions. */
export const trackEditor = {
  themeChanged: (themeId: string, isPremium: boolean) =>
    trackEvent({ name: "editor:theme_changed", payload: { theme_id: themeId, is_premium: isPremium } }),

  fontChanged: (fontId: string, isPremium: boolean) =>
    trackEvent({ name: "editor:font_changed", payload: { font_id: fontId, is_premium: isPremium } }),

  languageChanged: (language: string) =>
    trackEvent({ name: "editor:language_changed", payload: { language } }),

  paddingChanged: (padding: number) =>
    trackEvent({ name: "editor:padding_changed", payload: { padding } }),

  backgroundImageSet: () =>
    trackEvent({ name: "editor:background_image_set", payload: {} }),
};

/** Track premium gate triggers. */
export const trackPremiumGate = {
  triggered: (feature: string, accessLevel: string) =>
    trackEvent({ name: "premium_gate:triggered", payload: { feature, access_level: accessLevel } }),
};
