"use client";

import React from "react";
import type { Highlighter } from "shiki";
import { getHighlighter } from "@/components/editor/lib/highlighter";

interface FrameContextValue {
  highlighter: Highlighter | null;
  frameRefs: React.RefObject<Map<string, HTMLDivElement | null>>;
}

export const EditorContext = React.createContext<FrameContextValue>({
  highlighter: null,
  frameRefs: { current: new Map() },
});

export const EditorContextProvider: React.FC<React.PropsWithChildren> = (props) => {
  const aliveRef = React.useRef(false);
  const frameRefs = React.useRef<Map<string, HTMLDivElement | null>>(new Map());
  const [highlighter, setHighlighter] = React.useState<Highlighter | null>(null);

  /**
   * Use to get the highlighter instance and set it to the state.
   */
  React.useLayoutEffect(() => {
    aliveRef.current = false;

    getHighlighter().then((instance) => {
      if (!aliveRef.current) setHighlighter(instance);
    });

    return () => {
      aliveRef.current = true;
    };
  }, [setHighlighter]);

  return <EditorContext.Provider value={{ frameRefs, highlighter }} {...props} />;
};

export const useEditorContext = () => {
  const ctx = React.useContext(EditorContext);
  if (!ctx) throw new Error("useEditorContext must be used within a EditorContextProvider");
  return ctx;
};
