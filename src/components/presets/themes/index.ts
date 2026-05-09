import { Theme } from "@/typings/editor";
import { vercel } from "../vercel/theme";
import { rabbit } from "../rabbit/theme";
import { supabase } from "../supabase/theme";
import { tailwind } from "../tailwind/theme";
import { openai } from "../openai/theme";
import { mintlify } from "../mintlify/theme";
import { prisma } from "../prisma/theme";
import { clerk } from "../clerk/theme";
import { elevenlabs } from "../eleven-labs/theme";
import { resend } from "../resend/theme";
import { triggerdev } from "../triggerdev/theme";
import { nuxt } from "../nuxt/theme";
import { browserbase } from "../browserbase/theme";
import { cloudflare } from "../cloudflare/theme";
import { gemini } from "../gemini/theme";
import { stripe } from "../stripe/theme";
import { bitmap } from "../bitmap/theme";
import { noir } from "../noir/theme";
import { ice } from "../ice/theme";
import { sand } from "../sand/theme";
import { forest } from "../forest/theme";
import { mono } from "../mono/theme";
import { breeze } from "../breeze/theme";
import { candy } from "../candy/theme";
import { crimson } from "../crimson/theme";
import { falcon } from "../falcon/theme";
import { meadow } from "../meadow/theme";
import { midnight } from "../midnight/theme";
import { raindrop } from "../raindrop/theme";
import { sunset } from "../sunset/theme";
import { roses } from "../roses/theme";
import { claude } from "../claude/theme";
import { retroMac } from "../retro-mac/theme";
import { love } from "../love/theme";
import { valentine } from "../valentine/theme";
import { cottonCandy } from "../cotton-candy/theme";
import { coffeeDate } from "../coffee-date/theme";
import { sunsetChill } from "../sunset-chill/theme";
import { ps6 } from "../ps6/theme";

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
  claude,
  "retro-mac": retroMac,
  love,
  valentine,
  "cotton-candy": cottonCandy,
  "coffee-date": coffeeDate,
  "sunset-chill": sunsetChill,
  ps6,
  // "macos-terminal": macosTerminal,
  // All 66 Shiki bundled themes — syntax rendered natively by Shiki
  // ...shikiThemes,
};
