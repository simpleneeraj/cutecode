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

import { type Highlighter, createHighlighterCore, createOnigurumaEngine } from "shiki";
import { shikiTheme } from "../store/editor/theme";
import { LANGUAGES } from "../util/languages";

import tailwindLight from "../assets/tailwind/light.json";
import tailwindDark from "../assets/tailwind/dark.json";

let highlighterPromise: Promise<Highlighter> | null = null;

export function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighterCore({
      themes: [shikiTheme, tailwindLight, tailwindDark],
      langs: [
        LANGUAGES.javascript.src(),
        LANGUAGES.tsx.src(),
        LANGUAGES.swift.src(),
        LANGUAGES.python.src(),
      ],
      engine: createOnigurumaEngine(() => import("shiki/wasm")),
    }) as Promise<Highlighter>;
  }
  return highlighterPromise;
}
