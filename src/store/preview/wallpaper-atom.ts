import { atomWithStorage } from "jotai/utils";
import { StoreKey } from "../editor/editor/keys";
import { COLORS } from "@/features/share/colors";
import { MaskWallpaperOptions } from "@/plugings/mask-wallpaper/types";
import { PATTERN_SIZE, PATTERNS } from "@/features/share/patterns";

export const wallpaperOptionsAtom = atomWithStorage<MaskWallpaperOptions>(StoreKey.PREVIEW_WALLPAPER_OPTIONS, {
  fps: 30,
  tails: 30,
  animate: false,
  colors: COLORS[3].colors,
  scrollAnimate: false,
  pattern: {
    image: PATTERNS[2].path,
    background: "#000",
    size: `${PATTERN_SIZE}px`,
    opacity: 0.25,
    mask: true,
    blur: 0,
  },
});
