import { atomWithStorage } from "jotai/utils";
import { StoreKey } from "../editor/editor/keys";
import { COLORS } from "@/features/share/colors";
import { MaskWallpaperOptions } from "@/plugings/mask-wallpaper/types";
import { PATTERN_SIZE, PATTERNS } from "@/features/share/patterns";

export const wallpaperOptionsAtom = atomWithStorage<MaskWallpaperOptions>(StoreKey.PREVIEW_WALLPAPER_OPTIONS, {
  fps: 30,
  tails: 30,
  animate: false,
  // Warm "Calico" tones to match the parchment/espresso theme (was vivid pink).
  colors: COLORS[2].colors,
  scrollAnimate: false,
  pattern: {
    image: PATTERNS[8].path,
    background: "#000",
    size: `${PATTERN_SIZE}px`,
    // Subtle by default — a quiet textured canvas, not a busy emoji field.
    opacity: 0.1,
    mask: true,
    blur: 0,
  },
});
