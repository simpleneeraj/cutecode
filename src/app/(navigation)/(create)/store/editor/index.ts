import { atom } from "jotai";
import { produce } from "immer";
import deepmerge from "deepmerge";
import initialState, { createDefaultElement } from "./state";
import { createStorage } from "../storage";
import { atomWithStorage, selectAtom, unwrap } from "jotai/utils";
import { InitialValues } from "@/typings/editor";
import { EditorState, ElementType, SlideTypes } from "@/typings/editor";
import { Language, LANGUAGES } from "../../util/languages";
import { THEMES } from "../../constants/themes";
import { CSSProperties } from "react";

/* ------------------------------- */
/* Storage */
/* ------------------------------- */

const editorStorage = createStorage<EditorState>({
  name: "slides_store",
  version: 1,
});

const selectionStorage = createStorage<string | null>({
  name: "selection_store",
  version: 1,
});

/* ------------------------------- */
/* Core State */
/* ------------------------------- */

/** Persisted editor state — source of truth for all slides and elements. */
export const editorAtom = atomWithStorage<EditorState>("slides", initialState, editorStorage);

/** Derived atom that returns all slides as an array. */
export const slidesAtom = unwrap(
  atom(async (get) => {
    const state = await get(editorAtom);
    return Object.values(state.slides);
  }),
  (prev) => prev ?? [],
);

/** Async-resolved read-only view of the editor state. */
export const editorStateAtom = atom(async (get) => get(editorAtom));

/* ------------------------------- */
/* Selection */
/* ------------------------------- */

/** ID of the slide currently active in the editor. */
export const currentSlideIdAtom = atomWithStorage<string | null>(
  "selected_slide_id",
  InitialValues.SLIDE_ID,
  selectionStorage,
);

/** ID of the element currently selected on the active slide. */
export const currentElementIdAtom = atomWithStorage<string | null>(
  "selected_element_id",
  InitialValues.ELEMENT_ID,
  selectionStorage,
);

/** Selects a slide and auto-selects its first element. */
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

/** Selects an element by id. */
export const selectElementAtom = atom(null, (_get, set, elementId: string | null) => {
  set(currentElementIdAtom, elementId);
});

/* ------------------------------- */
/* Derived Current State */
/* ------------------------------- */

/** Derived atom that resolves the full element object for the current selection. */
export const currentElementAtom = unwrap(
  atom(async (get) => {
    const [state, elementId] = await Promise.all([get(editorAtom), get(currentElementIdAtom)]);
    if (!elementId) return null;
    return state.elements?.[elementId] ?? null;
  }),
  (prev) => prev ?? null,
);

/** Derived atom that resolves the full slide object for the current selection. */
export const currentSlideAtom = unwrap(
  atom(async (get) => {
    const [state, slideId] = await Promise.all([get(editorAtom), get(currentSlideIdAtom)]);
    if (!slideId) return null;
    return state.slides[slideId] ?? null;
  }),
  (prev) => prev ?? null,
);

/** Derived atom for element style only. */
export const currentElementStyleAtom = atom(async (get) => {
  const element = get(currentElementAtom);
  return element?.style ?? null;
});

/** Derived atom for element properties only. */
export const currentElementPropertiesAtom = atom(async (get) => {
  const element = get(currentElementAtom);
  return element?.properties ?? null;
});

/* ------------------------------- */
/* Slides CRUD */
/* ------------------------------- */

/** Inserts a new slide with a default element and selects it. */
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

/** Merges a partial patch into the current slide. */
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

/** Deletes the current slide and selects the next available one. */
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

/** Deep-clones the current slide with all its elements under new UUIDs. */
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

/* ------------------------------- */
/* Elements CRUD */
/* ------------------------------- */

const overwriteMerge = (_dest: unknown[], source: unknown[]) => source;

/** Registers a new element and appends it to the current slide. */
export const createSlideElementAtom = atom(null, async (get, set, element: ElementType) => {
  const slideId = await get(currentSlideIdAtom);
  if (!slideId) return;

  const prev = await get(editorAtom);
  set(
    editorAtom,
    produce(prev, (draft) => {
      if (!draft.slides[slideId]) return;
      draft.elements[element.id!] = element;
      draft.slideElements[slideId].push(element.id!);
    }),
  );
});

/** Deep-merges a patch into the currently selected element. */
export const updateSlideElementAtom = atom(null, async (get, set, patch: Partial<ElementType>) => {
  const elementId = await get(currentElementIdAtom);
  if (!elementId) return;

  const prev = await get(editorAtom);
  set(
    editorAtom,
    produce(prev, (draft) => {
      const element = draft.elements[elementId];
      if (!element) return;
      Object.assign(element, deepmerge(element, patch as ElementType, { arrayMerge: overwriteMerge }));
    }),
  );
});

/** Removes the selected element from both the element map and the slide list. */
export const deleteSlideElementAtom = atom(null, async (get, set) => {
  const slideId = await get(currentSlideIdAtom);
  const elementId = await get(currentElementIdAtom);
  if (!slideId || !elementId) return;

  const prev = await get(editorAtom);
  set(
    editorAtom,
    produce(prev, (draft) => {
      delete draft.elements[elementId];
      const list = draft.slideElements[slideId];
      if (!list) return;
      const index = list.indexOf(elementId);
      if (index !== -1) list.splice(index, 1);
    }),
  );
});

/** Deep-clones the selected element and appends it to the current slide. */
export const duplicateSlideElementAtom = atom(null, async (get, set) => {
  const slideId = await get(currentSlideIdAtom);
  const elementId = await get(currentElementIdAtom);
  if (!slideId || !elementId) return;

  const prev = await get(editorAtom);
  set(
    editorAtom,
    produce(prev, (draft) => {
      const element = draft.elements[elementId];
      if (!element) return;
      const newId = crypto.randomUUID();
      draft.elements[newId] = { ...structuredClone(element), id: newId };
      draft.slideElements[slideId].push(newId);
    }),
  );
});

/* ------------------------------- */
/* Reset */
/* ------------------------------- */

/** Wipes all editor state and restores initial defaults. */
export const resetEditorAtom = atom(null, (_get, set) => {
  set(editorAtom, initialState);
  set(currentSlideIdAtom, InitialValues.SLIDE_ID);
  set(currentElementIdAtom, InitialValues.ELEMENT_ID);
});

/* ------------------------------- */
/* Selectors */
/* ------------------------------- */

const DEFAULT_PADDING = "16px";

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

/* ------------------------------- */
/* Theme */
/* ------------------------------- */

export const themeAtom = selectAtom(currentElementAtom, (el) => {
  const themeId = el?.properties?.theme as string | undefined;
  return themeId && THEMES[themeId] ? THEMES[themeId] : THEMES.candy;
});

export const themeDarkModeAtom = atom<boolean>((get) => {
  const theme = get(themeAtom);
  const hasLight = !!theme.syntax.light;
  const hasDark = !!theme.syntax.dark;

  if (hasDark && !hasLight) return true;
  if (hasLight && !hasDark) return false;
  return get(elementDarkModeAtom);
});

export const themeCSSAtom = atom<CSSProperties>((get) => {
  const isDark = get(themeDarkModeAtom);
  const { syntax } = get(themeAtom);
  return (isDark ? syntax.dark : syntax.light) ?? syntax.light ?? syntax.dark ?? {};
});

export const themeBackgroundAtom = atom<string>((get) => {
  const { from, to } = get(themeAtom).background;
  return `linear-gradient(140deg, ${from}, ${to})`;
});

export const themeFontAtom = atom<string | null>((get) => get(themeAtom)?.font ?? "jetbrains-mono");

export const themeLineNumbersAtom = atom<boolean>((get) => {
  const theme = get(themeAtom);
  const showLineNumbers = get(elementShowLineNumbersAtom);

  if (theme.partner) {
    return theme.lineNumbersToggleable ? (showLineNumbers ?? theme.lineNumbers ?? false) : (theme.lineNumbers ?? false);
  }

  return showLineNumbers ?? false;
});

/* ------------------------------- */
/* Language */
/* ------------------------------- */

export const selectedLanguageAtom = atom(
  (get) => {
    const languageName = get(elementLanguageAtom);
    return Object.values(LANGUAGES).find((l) => l.name === languageName);
  },
  (_get, set, newLanguage: Language | null) => {
    set(updateSlideElementAtom, { properties: { language: newLanguage?.name } });
  },
);
