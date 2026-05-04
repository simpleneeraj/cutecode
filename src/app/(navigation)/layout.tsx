import React from "react";
import { cn } from "@/utils/cn";
import View from "@/components/view";
import editorFonts from "@/fonts/editor";
import globalFonts from "@/fonts/global";
import EditorProvider from "@/store/editor/providers/editor";
import { EditorContextProvider } from "@/store/editor/context/editor";

export default function NavigationLayout({ children }: { children: React.ReactNode }) {
  return (
    <EditorProvider>
      <EditorContextProvider>
        <View className={cn("h-screen flex flex-col", globalFonts, editorFonts)}>
          <main className="layout-fill">{children}</main>
        </View>
      </EditorContextProvider>
    </EditorProvider>
  );
}
