import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { Highlighter } from "shiki";
import { ElementType } from "@/typings/editor";
import { elementContentAtom, elementFileNameAtom } from "./selectors";
import { updateSlideElementAtom } from "./elements";
import { StoreKey } from "./keys";

/*
 * Shiki highlighter instance — set once on app boot.
 */
export const highlighterAtom = atom<Highlighter | null>(null);

/*
 * True while a new language grammar is being loaded by Shiki.
 */
export const loadingLanguageAtom = atom<boolean>(false);

/*
 * Width override for the resizable frame.
 * Persisted so the user's chosen width survives a reload. Null = auto.
 */
export const windowWidthAtom = atomWithStorage<number | null>(StoreKey.FRAME_WIDTH, null);

/*
 * Available export pixel-ratio options.
 */
export const EXPORT_SIZE_OPTIONS = [
  { label: "Normal (2×)", value: 2 },
  { label: "High Quality (4×)", value: 4 },
  { label: "Ultra HD (6×)", value: 6 },
] as const;

export type ExportSize = (typeof EXPORT_SIZE_OPTIONS)[number];

export function isExportSize(value: ExportSize | unknown): value is ExportSize {
  return EXPORT_SIZE_OPTIONS.indexOf(value as ExportSize) !== -1;
}

/*
 * Selected export pixel ratio — persisted to localStorage.
 */
export const exportSizeAtom = atomWithStorage<number>(StoreKey.EXPORT_SIZE, EXPORT_SIZE_OPTIONS[1].value);

/*
 * Writable compat atom for the active element's code content.
 */
export const codeAtom = atom(
  (get) => (get(elementContentAtom) as string | undefined) ?? "",
  (_get, set, newCode: string) => {
    set(updateSlideElementAtom, { content: newCode });
  },
);

/*
 * Writable compat atom for the active element's file name (header title).
 */
export const fileNameAtom = atom(
  (get) => get(elementFileNameAtom) ?? "",
  (_get, set, newName: string) => {
    set(updateSlideElementAtom, {
      header: { properties: { title: { text: newName } } },
    } as Partial<ElementType>);
  },
);

/*
 * Always false — code-example auto-select is not used in the slide model.
 */
export const isCodeExampleAtom = atom<boolean>(() => false);
