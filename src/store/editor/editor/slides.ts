import { atom } from "jotai";
import { produce } from "immer";
import { BACKGROUND_TYPE, InitialValues, SlideTypes } from "@/typings/editor";
import initialState, { createDefaultElement } from "./state";
import { editorAtom } from "./core";
import { currentSlideIdAtom, currentElementIdAtom, currentSlideAtom } from "./selection";

/*
 * Reads the current slide's background image URL.
 * Writing sets it (and switches the background type to IMAGE when set,
 * or back to GRADIENT when cleared).
 */
export const backgroundImageAtom = atom(
  (get) => {
    const image = get(currentSlideAtom)?.background?.properties?.image;
    return typeof image === "string" ? image : "";
  },
  (get, set, source: string) => {
    const slideId = get(currentSlideIdAtom);
    if (!slideId) return;
    set(
      editorAtom,
      produce(get(editorAtom), (draft) => {
        const slide = draft.slides[slideId];
        const defaultBackground = initialState.slides[InitialValues.SLIDE_ID].background;

        if (!slide.background) {
          slide.background = structuredClone(defaultBackground);
        }
        // TypeScript still thinks it might be undefined after the if-block,
        // so assert or re-check here
        const bg = slide.background!;

        bg.type = source ? BACKGROUND_TYPE.IMAGE : BACKGROUND_TYPE.GRADIENT;

        // Assign only the image field, preserving other properties
        if (!bg.properties) {
          bg.properties = { image: "", gradient: "" };
        }
        bg.properties.image = source;
      }),
    );
  },
);
/*
 * Inserts a new slide with a default element and selects it.
 */
export const createSlideAtom = atom(null, (get, set, slide: SlideTypes) => {
  const element = createDefaultElement();
  const elementId = element.id as string;

  set(
    editorAtom,
    produce(get(editorAtom), (draft) => {
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
export const updateSlideAtom = atom(null, (get, set, patch: Partial<Omit<SlideTypes, "id" | "elements">>) => {
  const slideId = get(currentSlideIdAtom);
  if (!slideId) return;

  set(
    editorAtom,
    produce(get(editorAtom), (draft) => {
      const slide = draft.slides[slideId];
      if (slide) Object.assign(slide, patch);
    }),
  );
});

/*
 * Deletes the current slide and selects the next available one.
 */
export const deleteSlideAtom = atom(null, (get, set) => {
  const slideId = get(currentSlideIdAtom);
  if (!slideId) return;

  const prev = get(editorAtom);
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
export const duplicateSlideAtom = atom(null, (get, set) => {
  const slideId = get(currentSlideIdAtom);
  if (!slideId) return;

  const newSlideId = crypto.randomUUID();

  set(
    editorAtom,
    produce(get(editorAtom), (draft) => {
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
  const newFirstElementId = get(editorAtom).slideElements[newSlideId]?.[0] ?? null;
  set(currentElementIdAtom, newFirstElementId);
});
