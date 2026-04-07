import { atom } from "jotai";
import { atomWithLocation } from "jotai-location";

export const plansDialogOpenAtom = atom(false);
export const locationAtom = atomWithLocation({ replace: true });
