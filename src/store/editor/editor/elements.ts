import { atom } from "jotai";
import { produce } from "immer";
import deepmerge from "deepmerge";
import { ElementType } from "@/typings/editor";
import { editorAtom } from "./core";
import { currentSlideIdAtom, currentElementIdAtom } from "./selection";

const overwriteMerge = (_dest: unknown[], source: unknown[]) => source;

/*
 * Registers a new element and appends it to the current slide.
 */
export const createSlideElementAtom = atom(null, (get, set, element: ElementType) => {
  const slideId = get(currentSlideIdAtom);
  if (!slideId) return;

  set(
    editorAtom,
    produce(get(editorAtom), (draft) => {
      if (!draft.slides[slideId]) return;
      draft.elements[element.id!] = element;
      draft.slideElements[slideId].push(element.id!);
    }),
  );
});

/*
 * Deep-merges a patch into the currently selected element.
 */
export const updateSlideElementAtom = atom(null, (get, set, patch: Partial<ElementType>) => {
  const elementId = get(currentElementIdAtom);
  if (!elementId) return;

  set(
    editorAtom,
    produce(get(editorAtom), (draft) => {
      const element = draft.elements[elementId];
      if (!element) return;
      Object.assign(element, deepmerge(element, patch as ElementType, { arrayMerge: overwriteMerge }));
    }),
  );
});

/*
 * Removes the selected element from the element map and slide list.
 */
export const deleteSlideElementAtom = atom(null, (get, set) => {
  const slideId = get(currentSlideIdAtom);
  const elementId = get(currentElementIdAtom);
  if (!slideId || !elementId) return;

  set(
    editorAtom,
    produce(get(editorAtom), (draft) => {
      delete draft.elements[elementId];
      const list = draft.slideElements[slideId];
      if (!list) return;
      const index = list.indexOf(elementId);
      if (index !== -1) list.splice(index, 1);
    }),
  );
});

/*
 * Deep-clones the selected element and appends it to the current slide.
 */
export const duplicateSlideElementAtom = atom(null, (get, set) => {
  const slideId = get(currentSlideIdAtom);
  const elementId = get(currentElementIdAtom);
  if (!slideId || !elementId) return;

  set(
    editorAtom,
    produce(get(editorAtom), (draft) => {
      const element = draft.elements[elementId];
      if (!element) return;
      const newId = crypto.randomUUID();
      draft.elements[newId] = { ...structuredClone(element), id: newId };
      draft.slideElements[slideId].push(newId);
    }),
  );
});
