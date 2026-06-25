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
import CoffeeDateFrame from "./coffee-date";
import SunsetChillFrame from "./sunset-chill";
import { themes } from "./themes";
import PS6Frame from "./ps6";
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

// Themes that share the generic UnifiedFrame (styling comes from their CSS module).
const SupabaseFrame = (props: BaseFrameProps) => <UnifiedFrame themeStyles={supabaseStyles} {...props} />;
const OpenAIFrame = (props: BaseFrameProps) => <UnifiedFrame themeStyles={openAiStyles} {...props} />;

/**
 * themeId → frame component. Replaces the old switch — adding a theme is now a
 * single entry here (plus its component + registration in `themes/index.ts`).
 */
const FRAME_REGISTRY: Record<string, React.ComponentType<BaseFrameProps>> = {
  [themes.vercel.id]: VercelFrame,
  [themes.rabbit.id]: VercelFrame,
  [themes.supabase.id]: SupabaseFrame,
  [themes.openai.id]: OpenAIFrame,
  [themes.tailwind.id]: TailwindFrame,
  [themes.clerk.id]: ClerkFrame,
  [themes.mintlify.id]: MintlifyFrame,
  [themes.triggerdev.id]: TriggerdevFrame,
  [themes.prisma.id]: PrismaFrame,
  [themes.elevenlabs.id]: ElevenLabsFrame,
  [themes.resend.id]: ResendFrame,
  [themes.browserbase.id]: BrowserbaseFrame,
  [themes.nuxt.id]: NuxtFrame,
  [themes.gemini.id]: GeminiFrame,
  [themes.cloudflare.id]: CloudflareFrame,
  [themes.stripe.id]: StripeFrame,
  [themes.roses.id]: RosesFrame,
  [themes.claude.id]: ClaudeFrame,
  [themes["retro-mac"].id]: RetroMacFrame,
  [themes.love.id]: LoveFrame,
  [themes.valentine.id]: ValentineFrame,
  [themes["coffee-date"].id]: CoffeeDateFrame,
  [themes["sunset-chill"].id]: SunsetChillFrame,
  [themes.ps6.id]: PS6Frame,
  [themes["aurora-nights"].id]: AuroraNightsFrame,
  [themes["starry-night"].id]: StarryNightFrame,
  [themes["strawberry-milk"].id]: StrawberryMilkFrame,
  [themes["frosted-glass"].id]: FrostedGlassFrame,
  [themes["velvet-night"].id]: VelvetNightFrame,
  [themes["peachy-mood"].id]: PeachyMoodFrame,
  [themes["neon-dreams"].id]: NeonDreamsFrame,
  [themes["golden-hour"].id]: GoldenHourFrame,
};

export function PresetFrame({ themeId, ...props }: BaseFrameProps) {
  const Frame = (themeId && FRAME_REGISTRY[themeId]) || DefaultFrame;
  return <Frame themeId={themeId} {...props} />;
}
