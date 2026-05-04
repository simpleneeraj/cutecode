import { CSSProperties } from "react";
import { Theme } from "@/typings/editor";
import { ShikiSyntaxObject } from "./types";

export const FirecrawlLogo = "/editor/assets/firecrawl/logo.svg";
export const FirecrawlLogoUrl = "/editor/assets/firecrawl/logo.svg";
export const CloudflareLogo = "/editor/assets/cloudflare.svg";
export const CloudflareLogoUrl = "/editor/assets/cloudflare.svg";
export const VercelLogo = "/editor/assets/vercel.svg";
export const VercelLogoUrl = "/editor/assets/vercel.svg";
export const RabbitLogo = "/editor/assets/rabbit.svg";
export const RabbitLogoUrl = "/editor/assets/rabbit.svg";
export const SupabaseLogo = "/editor/assets/supabase.svg";
export const SupabaseLogoUrl = "/editor/assets/supabase.svg";
export const TailwindLogo = "/editor/assets/tailwind.svg";
export const TailwindLogoUrl = "/editor/assets/tailwind.svg";
export const TriggerLogo = "/editor/assets/triggerdev.svg";
export const TriggerLogoUrl = "/editor/assets/triggerdev.svg";
export const GeminiLogo = "/editor/assets/gemini.svg";
export const GeminiLogoUrl = "/editor/assets/gemini.svg";
export const OpenAiLogo = "/editor/assets/openai.svg";
export const OpenAiLogoUrl = "/editor/assets/openai.svg";
export const ClerkLogo = "/editor/assets/clerk.svg";
export const ClerkLogoUrl = "/editor/assets/clerk.svg";
export const PrismaLogo = "/editor/assets/prisma.svg";
export const PrismaLogoUrl = "/editor/assets/prisma.svg";
export const MintlifyLogo = "/editor/assets/mintlify.svg";
export const MintlifyLogoUrl = "/editor/assets/mintlify.svg";
export const ElevenLabsLogo = "/editor/assets/elevenlabs.svg";
export const ElevenLabsLogoUrl = "/editor/assets/elevenlabs.svg";
export const ResendLogo = "/editor/assets/resend.svg";
export const ResendLogoUrl = "/editor/assets/resend.svg";
export const BrowserbaseLogo = "/editor/assets/browserbase.svg";
export const BrowserbaseLogoUrl = "/editor/assets/browserbase.svg";
export const NuxtLogo = "/editor/assets/nuxt.svg";
export const NuxtLogoUrl = "/editor/assets/nuxt.svg";
export const StripeLogo = "/editor/assets/stripe/logo.svg";
export const StripeLogoUrl = "/editor/assets/stripe/logo.svg";

export type ThemeGroup = { value: string; items: Partial<Theme>[] };

export function convertToShikiTheme(syntaxObject: ShikiSyntaxObject, prefix: string = "--cutecode-"): CSSProperties {
  if (!syntaxObject) {
    return {};
  }
  return {
    [`${prefix}foreground`]: syntaxObject.foreground,
    [`${prefix}token-constant`]: syntaxObject.constant,
    [`${prefix}token-string`]: syntaxObject.string,
    [`${prefix}token-comment`]: syntaxObject.comment,
    [`${prefix}token-keyword`]: syntaxObject.keyword,
    [`${prefix}token-parameter`]: syntaxObject.parameter,
    [`${prefix}token-function`]: syntaxObject.function,
    [`${prefix}token-string-expression`]: syntaxObject.stringExpression,
    [`${prefix}token-punctuation`]: syntaxObject.punctuation,
    [`${prefix}token-link`]: syntaxObject.link,
    [`${prefix}token-number`]: syntaxObject.number,
    [`${prefix}token-property`]: syntaxObject.property,
    [`${prefix}highlight`]: syntaxObject.highlight,
    [`${prefix}highlight-border`]: syntaxObject.highlightBorder,
    [`${prefix}highlight-hover`]: syntaxObject.highlightHover,
    [`${prefix}token-diff-deleted`]: syntaxObject.diffDeleted,
    [`${prefix}token-diff-inserted`]: syntaxObject.diffInserted,
    [`${prefix}token-object-literal`]: syntaxObject.objectLiteral,
  } as CSSProperties;
}

export function groupThemes(object: { [index: string]: Theme }) {
  const items = Object.values(object);
  const groups: Record<string, Partial<Theme>[]> = {};
  for (const theme of items) {
    if (!theme.group) continue;
    if (!groups[theme.group]) {
      groups[theme.group] = [];
    }
    groups[theme.group]!.push({
      id: theme?.id,
      name: theme?.name,
      group: theme?.group,
      icon: theme?.icon,
      background: theme.background,
    });
  }
  const order: Array<ThemeGroup["value"]> = ["Brands", "AI", "Defaults", "Shiki"];
  return order.map((value) => ({ items: groups[value] ?? [], value }));
}
