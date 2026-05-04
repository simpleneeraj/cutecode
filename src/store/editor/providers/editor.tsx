"use client";

import { useRef } from "react";
import { createStore, Provider } from "jotai";

type Props = {
  children: React.ReactNode;
};

export default function EditorProvider({ children }: Props) {
  const store = useRef(createStore()).current;
  return <Provider store={store}>{children}</Provider>;
}
