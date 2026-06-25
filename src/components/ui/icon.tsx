"use client";

import * as React from "react";
import * as Solar from "@solar-icons/react";
import type { IconWeight } from "@solar-icons/react";
import { cn } from "@/utils/cn";

/**
 * Icon — drop-in replacement for the old `@iconify/react` Icon.
 *
 * Accepts the same `icon="set:name-style"` strings the codebase already uses and
 * renders them with the Solar icon set (https://github.com/saoudi-h/solar-icons).
 *
 * - `solar:*`  → auto-resolved (kebab → PascalCase), `weight` from the style suffix.
 * - `ph:*` / emoji / misc sets → mapped to the closest Solar icon (see ALIAS).
 * - Brand logos Solar can't represent (X, LinkedIn, Facebook, Apple) → inline SVG.
 *
 * Size: defaults to `1em` so Tailwind `size-*` / `text-*` classes drive dimensions,
 * matching how the old Icon was used.
 */

type IconProps = Omit<React.SVGProps<SVGSVGElement>, "ref"> & {
  icon: string;
  /** Pixel size shortcut (maps to width + height). Prefer Tailwind `size-*` classes. */
  width?: number | string;
  height?: number | string;
};

type SolarComponent = React.ComponentType<
  React.SVGProps<SVGSVGElement> & { weight?: IconWeight; size?: string | number }
>;

const STYLE_TO_WEIGHT: Record<string, IconWeight> = {
  bold: "Bold",
  linear: "Linear",
  outline: "Outline",
  broken: "Broken",
  "bold-duotone": "BoldDuotone",
  "line-duotone": "LineDuotone",
};

// Non-solar icon strings → Solar component name. These render filled (Bold).
const ALIAS: Record<string, string> = {
  // Phosphor (UI)
  "ph:magnifying-glass": "Magnifer",
  "ph:house-simple": "House",
  "ph:cpu": "Cpu",
  "ph:clock": "ClockCircle",
  "ph:terminal": "Command",
  "ph:git-branch": "CodeSquare",
  // Decorative emoji → nearest Solar icon (no emoji glyphs)
  "fluent-emoji:sparkles": "Stars",
  "fluent-emoji:snowflake": "Snowflake",
  "noto:rose": "Leaf",
  "fluent-emoji:cherry-blossom": "Leaf",
  "fluent-emoji:strawberry": "Donut",
  "fluent-emoji:peach": "Donut",
  "fluent-emoji:lollipop": "Donut",
  "fluent-emoji:cotton-candy": "Donut",
  "fluent-emoji:hot-beverage": "CupHot",
  "fluent-emoji:sun-with-face": "Sun",
  "fluent-emoji:sunset": "Sunset",
  "fluent-emoji:rainbow": "CloudSun",
  "fluent-emoji:high-voltage": "Bolt",
  "fluent-emoji:crescent-moon": "Moon",
  "fluent-emoji:star": "Star",
  "fluent-emoji:dizzy": "SmileCircle",
  "fluent-emoji:heart-suit": "Heart",
  "fluent-emoji:purple-heart": "Heart",
  "fluent-emoji-flat:red-heart": "Heart",
  "noto:two-hearts": "Hearts",
  "noto:beating-heart": "Heart",
  "pixelarticons:heart": "Heart",
  // Misc brand-ish → closest Solar
  "simple-icons:playstation": "Gamepad",
  "devicon:git": "CodeSquare",
  "logos:claude-icon": "Stars",
  "vscode-icons:file-type-typescript-official": "CodeSquare",
};

// True brand logos with no Solar equivalent → inline SVG (currentColor, 1em).
const BRAND: Record<string, React.FC<{ className?: string }>> = {
  "ri:twitter-x-fill": ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  ),
  "ri:linkedin-fill": ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M6.94 5a2 2 0 1 1-4-.002 2 2 0 0 1 4 .002ZM7 8.48H3V21h4V8.48Zm6.32 0H9.34V21h3.94v-6.57c0-3.66 4.77-4 4.77 0V21H22v-7.93c0-6.17-7.06-5.94-8.72-2.91l.04-1.68Z" />
    </svg>
  ),
  "ri:facebook-circle-fill": ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.99 3.657 9.128 8.438 9.879v-6.988h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10Z" />
    </svg>
  ),
  "mingcute:apple-fill": ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.05 12.04c-.03-2.47 2.02-3.66 2.11-3.72-1.15-1.68-2.94-1.91-3.58-1.94-1.52-.15-2.97.9-3.74.9-.77 0-1.96-.88-3.23-.86-1.66.03-3.19.97-4.04 2.46-1.72 2.99-.44 7.41 1.23 9.84.82 1.19 1.79 2.52 3.07 2.47 1.23-.05 1.7-.8 3.19-.8 1.49 0 1.91.8 3.22.77 1.33-.02 2.17-1.21 2.98-2.41.94-1.38 1.33-2.72 1.35-2.79-.03-.01-2.59-.99-2.62-3.93ZM14.6 4.84c.68-.83 1.14-1.97 1.01-3.11-.98.04-2.17.65-2.87 1.47-.63.73-1.18 1.9-1.03 3.02 1.09.09 2.21-.55 2.89-1.38Z" />
    </svg>
  ),
};

function splitOnce(value: string, sep: string): [string, string] {
  const i = value.indexOf(sep);
  return i === -1 ? [value, ""] : [value.slice(0, i), value.slice(i + 1)];
}

function pascal(kebab: string): string {
  return kebab
    .split("-")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join("");
}

function resolveSolar(name: string): { Comp: SolarComponent; weight: IconWeight } | null {
  const [, rest] = splitOnce(name, ":"); // strip the `solar:` (or other) prefix
  // Detect a trailing style suffix (longest first for the two-word weights).
  const styles = Object.keys(STYLE_TO_WEIGHT).sort((a, b) => b.length - a.length);
  let base = rest;
  let weight: IconWeight = "Linear";
  for (const st of styles) {
    if (rest.endsWith(`-${st}`)) {
      base = rest.slice(0, -(st.length + 1));
      weight = STYLE_TO_WEIGHT[st];
      break;
    }
  }
  const Comp = (Solar as Record<string, unknown>)[pascal(base)] as SolarComponent | undefined;
  return Comp ? { Comp, weight } : null;
}

export function Icon({ icon, className, width, height, ...props }: IconProps) {
  const size = width ?? height ?? "1em";

  // 1. Brand logos (inline SVG)
  const Brand = BRAND[icon];
  if (Brand) return <Brand className={cn("inline-block size-[1em]", className)} />;

  // 2. Explicit alias (ph / emoji / misc) → Solar, rendered filled
  const aliasName = ALIAS[icon];
  if (aliasName) {
    const Comp = (Solar as Record<string, unknown>)[aliasName] as SolarComponent | undefined;
    if (Comp) return <Comp className={className} weight="Bold" size={size} {...props} />;
  }

  // 3. solar:* (and any set) auto-resolved
  const resolved = resolveSolar(icon);
  if (resolved) {
    const { Comp, weight } = resolved;
    return <Comp className={className} weight={weight} size={size} {...props} />;
  }

  // 4. Fallback — never crash on an unknown icon.
  return <Solar.QuestionCircle className={className} weight="Linear" size={size} {...props} />;
}

export default Icon;
