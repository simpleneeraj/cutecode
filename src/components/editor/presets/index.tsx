import { useAtomValue, useSetAtom } from "jotai";
import UnifiedFrame from "./UnifiedFrame";
import DefaultFrame from "./DefaultFrame";
import Editor from "../textarea";
import { presetsAtom, updateSlideElementAtom } from "@/store/editor/editor";
import { BaseFrameProps } from "@/typings/presets";

import VercelFrame from "./VercelFrame";
import ClerkFrame from "./ClerkFrame";
import TailwindFrame from "./TailwindFrame";
import NuxtFrame from "./NuxtFrame";
import RosesFrame from "./RosesFrame";
import PrismaFrame from "./PrismaFrame";
import CloudflareFrame from "./CloudflareFrame";
import FirecrawlFrame from "./FirecrawlFrame";
import AnthropicFrame from "./AnthropicFrame";
import GeminiFrame from "./GeminiFrame";
import MintlifyFrame from "./MintlifyFrame";
import ElevenLabsFrame from "./ElevenLabsFrame";
import ResendFrame from "./ResendFrame";
import StripeFrame from "./StripeFrame";
import BrowserbaseFrame from "./BrowserbaseFrame";
import TriggerdevFrame from "./TriggerdevFrame";
import RetroMacFrame from "./RetroMacFrame";

import openAiStyles from "@/styles/presets/OpenAIFrame.module.css";
import supabaseStyles from "@/styles/presets/SupabaseFrame.module.css";
import { themes } from "../themes";

export function PresetFrame({ themeId, ...props }: BaseFrameProps) {
  switch (themeId) {
    case themes.vercel.id:
    case themes.rabbit.id:
      return <VercelFrame themeId={themeId} {...props} />;
    case themes.supabase.id:
      return <UnifiedFrame themeId={themeId} themeStyles={supabaseStyles} {...props} />;
    case themes.tailwind.id:
      return <TailwindFrame themeId={themeId} {...props} />;
    case themes.clerk.id:
      return <ClerkFrame themeId={themeId} {...props} />;
    case themes.mintlify.id:
      return <MintlifyFrame themeId={themeId} {...props} />;
    case themes.openai.id:
      return <UnifiedFrame themeId={themeId} themeStyles={openAiStyles} {...props} />;
    case themes.triggerdev.id:
      return <TriggerdevFrame themeId={themeId} {...props} />;
    case themes.prisma.id:
      return <PrismaFrame themeId={themeId} {...props} />;
    case themes.elevenlabs.id:
      return <ElevenLabsFrame themeId={themeId} {...props} />;
    case themes.resend.id:
      return <ResendFrame themeId={themeId} {...props} />;
    case themes.browserbase.id:
      return <BrowserbaseFrame themeId={themeId} {...props} />;
    case themes.nuxt.id:
      return <NuxtFrame themeId={themeId} {...props} />;
    case themes.gemini.id:
      return <GeminiFrame themeId={themeId} {...props} />;
    case themes.cloudflare.id:
      return <CloudflareFrame themeId={themeId} {...props} />;
    case themes.stripe.id:
      return <StripeFrame themeId={themeId} {...props} />;
    case themes.firecrawl.id:
      return <FirecrawlFrame themeId={themeId} {...props} />;
    case themes.roses.id:
      return <RosesFrame themeId={themeId} {...props} />;
    case themes.anthropic.id:
      return <AnthropicFrame themeId={themeId} {...props} />;
    case themes["retro-mac"].id:
      return <RetroMacFrame themeId={themeId} {...props} />;
    default:
      return <DefaultFrame themeId={themeId} {...props} />;
  }
}

type PresetsProps = {
  id: string;
};

function Presets({ id }: PresetsProps) {
  const frame = useAtomValue(presetsAtom);
  const updateElement = useSetAtom(updateSlideElementAtom);

  console.log(frame);
  return (
    <PresetFrame
      {...frame}
      themeId={id}
      onFileNameChange={(name: string) => updateElement({ header: { properties: { title: { text: name } } } })}
    >
      <Editor />
    </PresetFrame>
  );
}

export default Presets;
