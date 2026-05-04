import { selectAtom } from "jotai/utils";
import { currentElementAtom } from "./selection";

const DEFAULT_PADDING = "16px";

/*
 * Flat selectors derived from the current element atom.
 * All values fall back to a safe default when the element is null.
 */

export const elementContentAtom = selectAtom(currentElementAtom, (el) => el?.content as string);
export const elementPaddingAtom = selectAtom(currentElementAtom, (el) => el?.style?.padding ?? DEFAULT_PADDING);
export const elementDarkModeAtom = selectAtom(currentElementAtom, (el) => el?.properties?.darkMode ?? false);
export const elementTransparentAtom = selectAtom(currentElementAtom, (el) => el?.properties?.transparent ?? false);
export const elementShowLineNumbersAtom = selectAtom(
  currentElementAtom,
  (el) => el?.properties?.showLineNumbers ?? false,
);
export const elementFontFamilyAtom = selectAtom(currentElementAtom, (el) => el?.style?.fontFamily ?? "");
export const elementFontSizeAtom = selectAtom(currentElementAtom, (el) => el?.style?.fontSize ?? 14);
export const elementFontWeightAtom = selectAtom(currentElementAtom, (el) => el?.style?.fontWeight ?? 400);
export const elementBackgroundAtom = selectAtom(currentElementAtom, (el) => el?.style?.background ?? "");
export const elementThemeAtom = selectAtom(currentElementAtom, (el) => el?.properties?.theme ?? "");
export const elementLanguageAtom = selectAtom(currentElementAtom, (el) => el?.properties?.language ?? "");
export const elementHighlightedLinesAtom = selectAtom(
  currentElementAtom,
  (el) => (el?.properties?.highlightedLines as number[]) ?? [],
);
export const elementHeaderAtom = selectAtom(currentElementAtom, (el) => el?.header ?? null);
export const elementFileNameAtom = selectAtom(currentElementAtom, (el) => el?.header?.properties?.title?.text ?? "");
export const elementFileIconAtom = selectAtom(currentElementAtom, (el) => el?.header?.properties?.title?.icon ?? "");
