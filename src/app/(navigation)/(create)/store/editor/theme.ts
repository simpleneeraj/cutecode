import { atom } from "jotai";
import { atomWithStorage, selectAtom } from "jotai/utils";
import { CSSProperties } from "react";
import { Theme } from "@/typings/editor";
import { THEMES } from "../../constants/themes";
import { createCssVariablesTheme } from "../../util/theme-css-variables";
import { currentElementAtom } from "./selection";
import { elementDarkModeAtom, elementShowLineNumbersAtom } from "./selectors";
import { StoreKey } from "./keys";

/*
 * Shiki CSS-variables theme used by the code highlighter.
 */
export const shikiTheme = createCssVariablesTheme({
  name: "css-variables",
  variablePrefix: "--ray-",
  variableDefaults: {},
  fontStyle: true,
});

/*
 * Theme object derived from the active element's theme property.
 * Falls back to the default "candy" theme.
 */
export const themeAtom = selectAtom(currentElementAtom, (el) => {
  const themeId = el?.properties?.theme as string | undefined;
  return themeId && THEMES[themeId] ? THEMES[themeId] : THEMES.candy;
});

/*
 * Resolves whether dark mode is active, respecting theme constraints.
 */
export const themeDarkModeAtom = atom<boolean>((get) => {
  const theme = get(themeAtom);
  const hasLight = !!theme.syntax.light;
  const hasDark = !!theme.syntax.dark;

  if (hasDark && !hasLight) return true;
  if (hasLight && !hasDark) return false;
  return get(elementDarkModeAtom);
});

/*
 * CSS variable map for the active theme's syntax colors.
 */
export const themeCSSAtom = atom<CSSProperties>((get) => {
  const isDark = get(themeDarkModeAtom);
  const { syntax } = get(themeAtom);
  return (isDark ? syntax.dark : syntax.light) ?? syntax.light ?? syntax.dark ?? {};
});

/*
 * Gradient background string for the active theme.
 */
export const themeBackgroundAtom = atom<string>((get) => {
  const { from, to } = get(themeAtom).background;
  return `linear-gradient(140deg, ${from}, ${to})`;
});

/*
 * Font family specified by the active theme, used as a fallback.
 */
export const themeFontAtom = atom<string | null>((get) => get(themeAtom)?.font ?? "jetbrains-mono");

/*
 * Whether line numbers should be shown, respecting partner-theme rules.
 */
export const themeLineNumbersAtom = atom<boolean>((get) => {
  const theme = get(themeAtom);
  const showLineNumbers = get(elementShowLineNumbersAtom);

  if (theme.partner) {
    return theme.lineNumbersToggleable
      ? (showLineNumbers ?? theme.lineNumbers ?? false)
      : (theme.lineNumbers ?? false);
  }

  return showLineNumbers ?? false;
});

/*
 * Themes the user has unlocked — persisted to localStorage.
 */
export const unlockedThemesAtom = atomWithStorage<Theme["id"][]>(StoreKey.UNLOCKED_THEMES, []);
