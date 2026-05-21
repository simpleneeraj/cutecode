import { useAtomValue, useSetAtom } from "jotai";
import UnifiedFrame from "./UnifiedFrame";
import DefaultFrame from "./default";
import { presetsAtom, updateSlideElementAtom } from "@/store/editor/editor";
import { BaseFrameProps } from "@/typings/presets";

import VercelFrame from "./vercel";
import ClerkFrame from "./clerk";
import TailwindFrame from "./tailwind";
import NuxtFrame from "./nuxt";
import RosesFrame from "./roses";
import PrismaFrame from "./prisma";
import CloudflareFrame from "./cloudflare";
import FirecrawlFrame from "./firecrawl";
import ClaudeFrame from "./claude";
import GeminiFrame from "./gemini";
import MintlifyFrame from "./mintlify";
import ElevenLabsFrame from "./eleven-labs";
import ResendFrame from "./resend";
import StripeFrame from "./stripe";
import BrowserbaseFrame from "./browserbase";
import TriggerdevFrame from "./triggerdev";
import RetroMacFrame from "./retro-mac";

import openAiStyles from "@/styles/presets/OpenAIFrame.module.css";
import supabaseStyles from "@/styles/presets/SupabaseFrame.module.css";
import LoveFrame from "./love";
import Editor from "../editor/textarea";
import ValentineFrame from "./valentine";
import CottonCandyFrame from "./cotton-candy";
import CoffeeDateFrame from "./coffee-date";
import SunsetChillFrame from "./sunset-chill";
import { themes } from "./themes";
import PS6Frame from "./ps6";
import MacOSTerminalFrame from "./terminals/mac-os";
import AuroraNightsFrame from "./aurora-nights";
import StarryNightFrame from "./starry-night";
import StrawberryMilkFrame from "./strawberry-milk";
import FrostedGlassFrame from "./frosted-glass";
import VelvetNightFrame from "./velvet-night";
import PeachyMoodFrame from "./peachy-mood";
import NeonDreamsFrame from "./neon-dreams";
import GoldenHourFrame from "./golden-hour";

type PresetsProps = {
  id: string;
};

export default function Presets({ id }: PresetsProps) {
  const frame = useAtomValue(presetsAtom);
  const updateElement = useSetAtom(updateSlideElementAtom);

  const onFileNameChange = (name: string) => updateElement({ header: { properties: { title: { text: name } } } });

  return (
    <PresetFrame {...frame} themeId={id} onFileNameChange={onFileNameChange}>
      <Editor />
    </PresetFrame>
  );
}

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
    // case themes.firecrawl.id:
    //   return <FirecrawlFrame themeId={themeId} {...props} />;
    case themes.roses.id:
      return <RosesFrame themeId={themeId} {...props} />;
    case themes.claude.id:
      return <ClaudeFrame themeId={themeId} {...props} />;
    case themes["retro-mac"].id:
      return <RetroMacFrame themeId={themeId} {...props} />;
    case themes.love.id:
      return <LoveFrame themeId={themeId} {...props} />;
    case themes.valentine.id:
      return <ValentineFrame themeId={themeId} {...props} />;
    // case themes["cotton-candy"].id:
    // return <CottonCandyFrame themeId={themeId} {...props} />;
    case themes["coffee-date"].id:
      return <CoffeeDateFrame themeId={themeId} {...props} />;
    case themes["sunset-chill"].id:
      return <SunsetChillFrame themeId={themeId} {...props} />;

    case themes.ps6.id:
      return <PS6Frame themeId={themeId} {...props} />;
    case themes["aurora-nights"].id:
      return <AuroraNightsFrame themeId={themeId} {...props} />;
    case themes["starry-night"].id:
      return <StarryNightFrame themeId={themeId} {...props} />;
    case themes["strawberry-milk"].id:
      return <StrawberryMilkFrame themeId={themeId} {...props} />;
    case themes["frosted-glass"].id:
      return <FrostedGlassFrame themeId={themeId} {...props} />;
    case themes["velvet-night"].id:
      return <VelvetNightFrame themeId={themeId} {...props} />;
    case themes["peachy-mood"].id:
      return <PeachyMoodFrame themeId={themeId} {...props} />;
    case themes["neon-dreams"].id:
      return <NeonDreamsFrame themeId={themeId} {...props} />;
    case themes["golden-hour"].id:
      return <GoldenHourFrame themeId={themeId} {...props} />;
    // case themes["macos-terminal"].id:
    //   return <MacOSTerminalFrame themeId={themeId} {...props} />;
    default:
      return <DefaultFrame themeId={themeId} {...props} />;
  }
}
