import React from "react";
import c from "@/fonts/editor";
import { cn } from "@/utils/cn";
import fonts from "@/fonts/global";
import EditorProvider from "./(create)/store/providers/editor";
import { FrameContextProvider } from "./(create)/store/context/frame";
import View from "@/components/view";

export default function NavigationLayout({ children }: { children: React.ReactNode }) {
  return (
    <FrameContextProvider>
      <EditorProvider>
        <View className={cn("h-screen flex flex-col", fonts, c)}>
          <main className="layout-fill">{children}</main>
        </View>
      </EditorProvider>
    </FrameContextProvider>
  );
}
