import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { EditorState } from "@/typings/editor";
import { StoreKey } from "./keys";
import initialState from "./state";

/*
 * Source of truth — every slide and element lives here.
 * Backed by jotai's default synchronous localStorage adapter.
 */
export const editorAtom = atomWithStorage<EditorState>(StoreKey.SLIDES, initialState);

/*
 * Read-only view of the full editor state.
 */
export const editorStateAtom = atom<EditorState>((get) => get(editorAtom));

/*
 * All slides as a flat array.
 */
export const slidesAtom = atom((get) => Object.values(get(editorAtom).slides));
