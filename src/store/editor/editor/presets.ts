import { atom } from "jotai";
import { currentElementAtom } from "./selection";
import { themeBackgroundAtom } from "./theme";
import { selectedLanguageAtom } from "./language";
import { windowWidthAtom, exportSizeAtom } from "./ui";
import { backgroundImageAtom } from "./slides";

/*
 * Single composite atom that provides every piece of data the Presets
 * (frame-rendering) component needs.  Consuming it costs exactly ONE
 * subscription instead of the previous ten.
 *
 * Usage:
 *   const frame = useAtomValue(presetsAtom);
 *   const updateElement = useSetAtom(updateSlideElementAtom); // write-only, stays separate
 */
export const presetsAtom = atom((get) => {
  const el = get(currentElementAtom);

  return {
    // Element-derived
    padding: el?.style?.padding ?? "16px",
    darkMode: el?.properties?.darkMode ?? false,
    transparent: el?.properties?.transparent ?? false,
    fileName: el?.header?.properties?.title?.text ?? "",
    code: el?.content as string,

    // Theme slice
    themeBackground: get(themeBackgroundAtom),

    // Background image (overrides theme gradient when set)
    backgroundImage: get(backgroundImageAtom),

    // Language slice
    selectedLanguage: get(selectedLanguageAtom) ?? null,

    // UI slice
    windowWidth: get(windowWidthAtom),
    exportSize: get(exportSizeAtom),

  };
});
