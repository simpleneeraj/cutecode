import { atom } from "jotai";
import { atomWithStorage, unwrap } from "jotai/utils";
import { EditorState } from "@/typings/editor";
import initialState from "./state";
import { createStorage } from "../storage";
import { StoreKey } from "./keys";

/*
 * Persistent storage adapter for the editor state.
 */
const editorStorage = createStorage<EditorState>({
  name: StoreKey.SLIDES_STORE,
  version: 1,
});

/*
 * Source of truth — every slide and element lives here.
 */
export const editorAtom = atomWithStorage<EditorState>(StoreKey.SLIDES, initialState, editorStorage);

/*
 * Async-resolved read-only view of the full editor state.
 */
export const editorStateAtom = atom(async (get) => get(editorAtom));

/*
 * All slides as a flat array. Falls back to [] while loading.
 */
export const slidesAtom = unwrap(
  atom(async (get) => {
    const state = await get(editorAtom);
    return Object.values(state.slides);
  }),
  (prev) => prev ?? [],
);
