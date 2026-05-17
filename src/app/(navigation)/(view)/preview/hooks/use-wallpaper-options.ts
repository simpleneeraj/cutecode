import { useAtom } from "jotai";
import { wallpaperOptionsAtom } from "@/store/preview/wallpaper-atom";
import { MaskWallpaperOptions } from "@/plugings/mask-wallpaper/types";

export function useWallpaperOptions() {
  const [wallpaperOptions, setWallpaperOptions] = useAtom(wallpaperOptionsAtom);

  const updateWallpaperOptions = (patch: Partial<MaskWallpaperOptions>) =>
    setWallpaperOptions((prev) => ({ ...prev, ...patch }));

  const updatePatternOptions = (patch: Partial<MaskWallpaperOptions["pattern"]>) =>
    setWallpaperOptions((prev) => ({
      ...prev,
      pattern: { ...prev.pattern, ...patch },
    }));

  return { wallpaperOptions, updateWallpaperOptions, updatePatternOptions };
}
