"use client";

import React from "react";
import View from "@/components/view";
import { Header } from "../components/header";
import { FrameContextProvider } from "./store/context/frame";

export default function CodeLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <View className="layout-fill">
      <Header />
      {children}
    </View>
  );
}
