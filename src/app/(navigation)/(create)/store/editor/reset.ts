import { atom } from "jotai";
import { InitialValues } from "@/typings/editor";
import initialState from "./state";
import { editorAtom } from "./core";
import { currentSlideIdAtom, currentElementIdAtom } from "./selection";

/*
 * Wipes all editor state and restores initial defaults.
 */
export const resetEditorAtom = atom(null, (_get, set) => {
  set(editorAtom, initialState);
  set(currentSlideIdAtom, InitialValues.SLIDE_ID);
  set(currentElementIdAtom, InitialValues.ELEMENT_ID);
});
