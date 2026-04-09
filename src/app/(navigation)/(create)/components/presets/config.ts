import React from "react";
import UnifiedFrame from "./UnifiedFrame";

// Import Custom Frames
import VercelFrame from "./VercelFrame";
import ClerkFrame from "./ClerkFrame";
import TailwindFrame from "./TailwindFrame";
import NuxtFrame from "./NuxtFrame";
import RosesFrame from "./RosesFrame";
import PrismaFrame from "./PrismaFrame";
import DefaultFrame from "./DefaultFrame";
import CloudflareFrame from "./CloudflareFrame";
import FirecrawlFrame from "./FirecrawlFrame";
import AnthropicFrame from "./AnthropicFrame";
import CandyFrame from "./CandyFrame";
import GeminiFrame from "./GeminiFrame";
import MintlifyFrame from "./MintlifyFrame";
import ElevenLabsFrame from "./ElevenLabsFrame";
import ResendFrame from "./ResendFrame";
import StripeFrame from "./StripeFrame";
import BrowserbaseFrame from "./BrowserbaseFrame";
import TriggerdevFrame from "./TriggerdevFrame";

// Import Styles for Unified Frames (those that get simplified)
import openAiStyles from "./OpenAIFrame.module.css";
import supabaseStyles from "./SupabaseFrame.module.css";
// import mintlifyStyles from "./MintlifyFrame.module.css";
// import elevenLabsStyles from "./ElevenLabsFrame.module.css";
// import resendStyles from "./ResendFrame.module.css";
// import browserbaseStyles from "./BrowserbaseFrame.module.css";
// import triggerdevStyles from "./TriggerdevFrame.module.css";

export interface BaseFrameProps {
  padding: string | number | any;
  darkMode: boolean;
  transparent: boolean;
  themeBackground: string;
  fileName: string;
  onFileNameChange: (name: string) => void;
  selectedLanguage: { name?: string; value?: string } | null;
  flashShown: boolean;
  windowWidth: number | null;
  code: string;
  exportSize: number | null;
  themeId?: string;
}

export interface FrameConfig {
  /** Provide this if the frame has custom React DOM beyond standard wrapper. */
  Component?: React.FC<BaseFrameProps>;
  /** Provide this if the frame should be automatically built by UnifiedFrame. */
  styles?: { readonly [key: string]: string };
}

// NOTE: We temporarily map everything to their Component.
// As we simplify them to use UnifiedFrame we will replace `Component` with `styles`.
export const FrameRegistry: Record<string, FrameConfig> = {
  vercel: { Component: VercelFrame },
  rabbit: { Component: VercelFrame },
  supabase: { styles: supabaseStyles },
  tailwind: { Component: TailwindFrame },
  clerk: { Component: ClerkFrame },
  mintlify: { Component: MintlifyFrame },
  openai: { styles: openAiStyles },
  triggerdev: { Component: TriggerdevFrame },
  prisma: { Component: PrismaFrame },
  elevenlabs: { Component: ElevenLabsFrame },
  resend: { Component: ResendFrame },
  browserbase: { Component: BrowserbaseFrame },
  nuxt: { Component: NuxtFrame },
  gemini: { Component: GeminiFrame },
  cloudflare: { Component: CloudflareFrame },
  stripe: { Component: StripeFrame },
  firecrawl: { Component: FirecrawlFrame },
  roses: { Component: RosesFrame },
  anthropic: { Component: AnthropicFrame },
  candy: { Component: CandyFrame },
  default: { Component: DefaultFrame },
};

export const getFrameConfig = (id: string): FrameConfig => {
  return FrameRegistry[id] || FrameRegistry.default;
};
