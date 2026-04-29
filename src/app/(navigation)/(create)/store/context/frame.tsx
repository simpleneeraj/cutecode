"use client";

import React, { createContext, PropsWithChildren, useContext, useRef, useState } from "react";
import type { Highlighter } from "shiki";

interface FrameContextValue {
  frameRefs: React.RefObject<Map<string, HTMLDivElement | null>>;
  highlighter: Highlighter | null;
  setHighlighter: (h: Highlighter) => void;
}

export const FrameContext = createContext<FrameContextValue>({
  frameRefs: { current: new Map() },
  highlighter: null,
  setHighlighter: () => {},
});

export const FrameContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const frameRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const [highlighter, setHighlighter] = useState<Highlighter | null>(null);

  return (
    <FrameContext.Provider value={{ frameRefs, highlighter, setHighlighter }}>
      {children}
    </FrameContext.Provider>
  );
};

export const useFrameContext = () => {
  const ctx = useContext(FrameContext);
  if (!ctx) throw new Error("useFrameContext must be used within a FrameContextProvider");
  return ctx;
};
