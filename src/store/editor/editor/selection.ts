import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { StoreKey } from "./keys";
import { editorAtom } from "./core";
import { InitialValues } from "@/typings/editor";

/*
 * Active slide ID — persisted across reloads.
 */
export const currentSlideIdAtom = atomWithStorage<string | null>(StoreKey.CURRENT_SLIDE_ID, InitialValues.SLIDE_ID);

/*
 * Active element ID — persisted across reloads.
 */
export const currentElementIdAtom = atomWithStorage<string | null>(
  StoreKey.CURRENT_ELEMENT_ID,
  InitialValues.ELEMENT_ID,
);

/*
 * Selects a slide and auto-selects its first element.
 */
export const selectSlideAtom = atom(null, (get, set, slideId: string | null) => {
  set(currentSlideIdAtom, slideId);

  if (!slideId) {
    set(currentElementIdAtom, null);
    return;
  }

  const state = get(editorAtom);
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
export const currentElementAtom = atom((get) => {
  const state = get(editorAtom);
  const elementId = get(currentElementIdAtom);
  if (!elementId) return null;
  return state.elements?.[elementId] ?? null;
});

/*
 * Resolved slide object for the current selection.
 */
export const currentSlideAtom = atom((get) => {
  const state = get(editorAtom);
  const slideId = get(currentSlideIdAtom);
  if (!slideId) return null;
  return state.slides[slideId] ?? null;
});

/*
 * Style subset of the current element.
 */
export const currentElementStyleAtom = atom((get) => get(currentElementAtom)?.style ?? null);

/*
 * Properties subset of the current element.
 */
export const currentElementPropertiesAtom = atom((get) => get(currentElementAtom)?.properties ?? null);
