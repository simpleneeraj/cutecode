import { atom } from "jotai";
import { Language, LANGUAGES } from "@/components/editor/util/languages";
import { elementLanguageAtom } from "./selectors";
import { updateSlideElementAtom } from "./elements";

/*
 * Writable atom for the active element's language.
 * Reading returns the matched Language object; writing persists the name.
 */
export const selectedLanguageAtom = atom(
  (get) => {
    const languageName = get(elementLanguageAtom);
    return Object.values(LANGUAGES).find((l) => l.name === languageName);
  },
  (_get, set, newLanguage: Language | null) => {
    set(updateSlideElementAtom, { properties: { language: newLanguage?.name } });
  },
);

/*
 * True when no language has been explicitly set (empty string = auto-detect).
 */
export const autoDetectLanguageAtom = atom<boolean>((get) => !get(elementLanguageAtom));
