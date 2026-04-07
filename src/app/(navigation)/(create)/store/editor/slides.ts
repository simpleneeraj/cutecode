import { atom } from "jotai";
import { produce } from "immer";
import { SlideTypes } from "@/typings/editor";
import { createDefaultElement } from "./state";
import { editorAtom } from "./core";
import { currentSlideIdAtom, currentElementIdAtom } from "./selection";

/*
 * Inserts a new slide with a default element and selects it.
 */
export const createSlideAtom = atom(null, async (get, set, slide: SlideTypes) => {
  const [prev, element] = [await get(editorAtom), createDefaultElement()];
  const elementId = element.id as string;

  set(
    editorAtom,
    produce(prev, (draft) => {
      draft.slides[slide.id] = slide;
      draft.elements[elementId] = element;
      draft.slideElements[slide.id] = [elementId];
    }),
  );

  set(currentSlideIdAtom, slide.id);
  set(currentElementIdAtom, elementId);
});

/*
 * Merges a partial patch into the current slide.
 */
export const updateSlideAtom = atom(null, async (get, set, patch: Partial<Omit<SlideTypes, "id" | "elements">>) => {
  const slideId = await get(currentSlideIdAtom);
  if (!slideId) return;

  const prev = await get(editorAtom);
  set(
    editorAtom,
    produce(prev, (draft) => {
      const slide = draft.slides[slideId];
      if (slide) Object.assign(slide, patch);
    }),
  );
});

/*
 * Deletes the current slide and selects the next available one.
 */
export const deleteSlideAtom = atom(null, async (get, set) => {
  const slideId = await get(currentSlideIdAtom);
  if (!slideId) return;

  const prev = await get(editorAtom);
  const nextSlide = Object.values(prev.slides).find((s) => s.id !== slideId) ?? null;
  const nextElementId = nextSlide ? (prev.slideElements[nextSlide.id]?.[0] ?? null) : null;

  set(
    editorAtom,
    produce(prev, (draft) => {
      const elementIds = draft.slideElements[slideId] ?? [];
      for (const id of elementIds) delete draft.elements[id];
      delete draft.slideElements[slideId];
      delete draft.slides[slideId];
    }),
  );

  set(currentSlideIdAtom, nextSlide?.id ?? null);
  set(currentElementIdAtom, nextElementId);
});

/*
 * Deep-clones the current slide with all its elements under new UUIDs.
 */
export const duplicateSlideAtom = atom(null, async (get, set) => {
  const slideId = await get(currentSlideIdAtom);
  if (!slideId) return;

  const prev = await get(editorAtom);
  const newSlideId = crypto.randomUUID();

  set(
    editorAtom,
    produce(prev, (draft) => {
      const slide = draft.slides[slideId];
      if (!slide) return;

      draft.slides[newSlideId] = { ...slide, id: newSlideId };
      draft.slideElements[newSlideId] = draft.slideElements[slideId].map((id) => {
        const newId = crypto.randomUUID();
        draft.elements[newId] = { ...draft.elements[id], id: newId };
        return newId;
      });
    }),
  );

  set(currentSlideIdAtom, newSlideId);
  const newFirstElementId = (await get(editorAtom)).slideElements[newSlideId]?.[0] ?? null;
  set(currentElementIdAtom, newFirstElementId);
});
