import { atom } from "jotai";
import { PublishSnippetState, Visibility } from "./types";

export const publishSnippetAtom = atom<PublishSnippetState>({
  passcode: "",
  description: "",
  publishedUrl: null,
  isPublishing: false,
  isSuccessOpen: false,
  visibility: Visibility.PRIVATE,
});

export const dispatchPublishSnippetAtom = atom(null, (_, set, patch: Partial<PublishSnippetState>) => {
  set(publishSnippetAtom, (prev) => ({ ...prev, ...patch }));
});
