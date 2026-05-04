import { Theme } from "@/typings/editor";
import { vercel } from "./vercel";
import { rabbit } from "./rabbit";
import { supabase } from "./supabase";
import { tailwind } from "./tailwind";
import { openai } from "./openai";
import { mintlify } from "./mintlify";
import { prisma } from "./prisma";
import { clerk } from "./clerk";
import { elevenlabs } from "./elevenlabs";
import { resend } from "./resend";
import { triggerdev } from "./triggerdev";
import { nuxt } from "./nuxt";
import { browserbase } from "./browserbase";
import { cloudflare } from "./cloudflare";
import { gemini } from "./gemini";
import { stripe } from "./stripe";
import { bitmap } from "./bitmap";
import { noir } from "./noir";
import { ice } from "./ice";
import { sand } from "./sand";
import { forest } from "./forest";
import { mono } from "./mono";
import { breeze } from "./breeze";
import { candy } from "./candy";
import { crimson } from "./crimson";
import { falcon } from "./falcon";
import { meadow } from "./meadow";
import { midnight } from "./midnight";
import { raindrop } from "./raindrop";
import { sunset } from "./sunset";
import { roses } from "./roses";
import { firecrawl } from "./firecrawl";
import { anthropic } from "./anthropic";
import { retroMac } from "./retro-mac";
import shikiThemes from "./shiki-themes";
export { groupThemes } from "./shared";

export const themes: { [index: string]: Theme } = {
  vercel,
  rabbit,
  supabase,
  tailwind,
  openai,
  mintlify,
  prisma,
  clerk,
  elevenlabs,
  resend,
  triggerdev,
  nuxt,
  browserbase,
  cloudflare,
  gemini,
  stripe,
  bitmap,
  noir,
  ice,
  sand,
  forest,
  mono,
  breeze,
  candy,
  crimson,
  falcon,
  meadow,
  midnight,
  raindrop,
  sunset,
  roses,
  firecrawl,
  anthropic,
  "retro-mac": retroMac,
  // All 66 Shiki bundled themes — syntax rendered natively by Shiki
  ...shikiThemes,
};
