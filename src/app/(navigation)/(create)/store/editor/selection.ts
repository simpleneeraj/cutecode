import { atom } from "jotai";
import { atomWithStorage, unwrap } from "jotai/utils";
import { InitialValues } from "@/typings/editor";
import { createStorage } from "../storage";
import { editorAtom } from "./core";
import { StoreKey } from "./keys";

const selectionStorage = createStorage<string | null>({
  name: StoreKey.SELECTION_STORE,
  version: 1,
});

/*
 * Active slide ID — persisted across reloads.
 */
export const currentSlideIdAtom = atomWithStorage<string | null>(
  StoreKey.CURRENT_SLIDE_ID,
  InitialValues.SLIDE_ID,
  selectionStorage,
);

/*
 * Active element ID — persisted across reloads.
 */
export const currentElementIdAtom = atomWithStorage<string | null>(
  StoreKey.CURRENT_ELEMENT_ID,
  InitialValues.ELEMENT_ID,
  selectionStorage,
);

/*
 * Selects a slide and auto-selects its first element.
 */
export const selectSlideAtom = atom(null, async (get, set, slideId: string | null) => {
  set(currentSlideIdAtom, slideId);

  if (!slideId) {
    set(currentElementIdAtom, null);
    return;
  }

  const state = await get(editorAtom);
  const firstElementId = state.slideElements[slideId]?.[0] ?? null;
  set(currentElementIdAtom, firstElementId);
});

/*
 * Selects an element by id.
 */
export const selectElementAtom = atom(null, (_get, set, elementId: string | null) => {
  set(currentElementIdAtom, elementId);
});

/*
 * Resolved element object for the current selection.
 */
export const currentElementAtom = unwrap(
  atom(async (get) => {
    const [state, elementId] = await Promise.all([get(editorAtom), get(currentElementIdAtom)]);
    if (!elementId) return null;
    return state.elements?.[elementId] ?? null;
  }),
  (prev) => prev ?? null,
);

/*
 * Resolved slide object for the current selection.
 */
export const currentSlideAtom = unwrap(
  atom(async (get) => {
    const [state, slideId] = await Promise.all([get(editorAtom), get(currentSlideIdAtom)]);
    if (!slideId) return null;
    return state.slides[slideId] ?? null;
  }),
  (prev) => prev ?? null,
);

/*
 * Style subset of the current element.
 */
export const currentElementStyleAtom = atom(async (get) => {
  const element = get(currentElementAtom);
  return element?.style ?? null;
});

/*
 * Properties subset of the current element.
 */
export const currentElementPropertiesAtom = atom(async (get) => {
  const element = get(currentElementAtom);
  return element?.properties ?? null;
});
