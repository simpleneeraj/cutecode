import { useContext } from "react";
import { useAtomValue } from "jotai";
import { FrameContext } from "../store/context/frame";
import FlashMessage from "./FlashMessage";
import ResizableFrame from "./ResizableFrame";
import BrowserbaseFrame from "./frames/BrowserbaseFrame";
import ClerkFrame from "./frames/ClerkFrame";
import CloudflareFrame from "./frames/CloudflareFrame";
import DefaultFrame from "./frames/DefaultFrame";
import ElevenLabsFrame from "./frames/ElevenLabsFrame";
import FirecrawlFrame from "./frames/FirecrawlFrame";
import GeminiFrame from "./frames/GeminiFrame";
import MintlifyFrame from "./frames/MintlifyFrame";
import NuxtFrame from "./frames/NuxtFrame";
import OpenAIFrame from "./frames/OpenAIFrame";
import PrismaFrame from "./frames/PrismaFrame";
import ResendFrame from "./frames/ResendFrame";
import StripeFrame from "./frames/StripeFrame";
import SupabaseFrame from "./frames/SupabaseFrame";
import TailwindFrame from "./frames/TailwindFrame";
import TriggerdevFrame from "./frames/TriggerdevFrame";
import VercelFrame from "./frames/VercelFrame";

import { cn } from "@/utils/cn";
import styles from "./Frame.module.css";
import ToolbarParticle from "./Toolbar";
import { THEMES } from "../constants/themes";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { currentElementAtom, currentSlideAtom } from "../store/editor";

type Presets = {
  id: string;
};

const toolbarVariants: Variants = {
  hidden: { opacity: 0, y: -8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
  },
};

const frameInnerVariants: Variants = {
  hidden: {
    opacity: 0,
    filter: "blur(8px)",
  },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] },
  },
};

const Frame = () => {
  const frameRefs = useContext(FrameContext);

  const elementState = useAtomValue(currentElementAtom);
  const themeId = elementState?.properties?.theme!;
  const darkMode = (elementState?.properties?.darkMode as boolean) ?? false;

  const slide = useAtomValue(currentSlideAtom);

  return (
    <div className={cn(styles.frameContainer)} data-theme={darkMode ? "dark" : "light"}>
      <AnimatePresence mode="wait">
        {slide && (
          <motion.div
            key={slide.id}
            className="w-full flex flex-col items-center justify-center"
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div className="flex items-center justify-center mb-4" variants={toolbarVariants}>
              <ToolbarParticle />
            </motion.div>

            <motion.div variants={frameInnerVariants}>
              <ResizableFrame>
                <FlashMessage />
                <div
                  id="frame"
                  className={styles.outerFrame}
                  ref={(el) => {
                    frameRefs.current.set(slide.id, el);
                  }}
                >
                  <Presets id={themeId} />
                </div>
              </ResizableFrame>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Frame;

function Presets({ id }: Presets) {
  switch (id) {
    case THEMES.vercel.id:
    case THEMES.rabbit.id:
      return <VercelFrame />;
    case THEMES.supabase.id:
      return <SupabaseFrame />;
    case THEMES.tailwind.id:
      return <TailwindFrame />;
    case THEMES.clerk.id:
      return <ClerkFrame />;
    case THEMES.mintlify.id:
      return <MintlifyFrame />;
    case THEMES.openai.id:
      return <OpenAIFrame />;
    case THEMES.triggerdev.id:
      return <TriggerdevFrame />;
    case THEMES.prisma.id:
      return <PrismaFrame />;
    case THEMES.elevenlabs.id:
      return <ElevenLabsFrame />;
    case THEMES.resend.id:
      return <ResendFrame />;
    case THEMES.browserbase.id:
      return <BrowserbaseFrame />;
    case THEMES.nuxt.id:
      return <NuxtFrame />;
    case THEMES.gemini.id:
      return <GeminiFrame />;
    case THEMES.cloudflare.id:
      return <CloudflareFrame />;
    case THEMES.stripe.id:
      return <StripeFrame />;
    case THEMES.firecrawl.id:
      return <FirecrawlFrame />;
    default:
      return <DefaultFrame />;
  }
}
