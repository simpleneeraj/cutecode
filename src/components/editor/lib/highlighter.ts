/**
 * lib/highlighter.ts
 *
 * Shiki highlighter singleton.
 *
 * createHighlighterCore() is called ONCE at module-load time and the resulting
 * promise is cached. Any number of components (or hot-reloads) that call
 * `getHighlighter()` will all await the same promise, so only a single Shiki
 * instance is ever created per page lifecycle.
 */

import { type Highlighter, createHighlighterCore, createOnigurumaEngine, bundledThemes } from "shiki";
import { LANGUAGES } from "../util/languages";

import tailwindLight from "./tailwind-themes/light.json";
import tailwindDark from "./tailwind-themes/dark.json";
import { createCssVariablesTheme } from "../util/theme-css-variables";

/*
 * Shiki CSS-variables theme used for custom CuteCode themes.
 * Colors are injected via --cutecode-* CSS variables.
 */
const shikiTheme = createCssVariablesTheme({
  name: "cutecode-theme",
  variablePrefix: "--cutecode-",
  variableDefaults: {},
  fontStyle: true,
});

let highlighterPromise: Promise<Highlighter> | null = null;

export function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighterCore({
      themes: [
        shikiTheme,
        tailwindLight,
        tailwindDark,
        // All 66 Shiki bundled themes — loaded lazily via dynamic imports
        ...Object.values(bundledThemes),
      ],
      langs: [LANGUAGES.javascript.src(), LANGUAGES.tsx.src(), LANGUAGES.swift.src(), LANGUAGES.python.src()],
      engine: createOnigurumaEngine(() => import("shiki/wasm")),
    }) as Promise<Highlighter>;
  }
  return highlighterPromise;
}
