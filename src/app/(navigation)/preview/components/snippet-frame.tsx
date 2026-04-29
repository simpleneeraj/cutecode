"use client";

import React from "react";
import { BaseFrameProps, getFrameConfig } from "@/app/(navigation)/(create)/components/presets/config";
import UnifiedFrame from "@/app/(navigation)/(create)/components/presets/UnifiedFrame";
import DefaultFrame from "@/app/(navigation)/(create)/components/presets/DefaultFrame";
import { PreviewEditorContext } from "@/app/(navigation)/(create)/components/PreviewEditorContext";

type RawElement = Record<string, unknown>;

type SnippetFrameProps = {
  elementId: string;
  element: RawElement;
  windowWidth: number;
};

export function SnippetFrame({ elementId, element, windowWidth }: SnippetFrameProps) {
  const props = element.properties as Record<string, unknown> | undefined;
  const style = element.style as Record<string, unknown> | undefined;
  const header = element.header as { properties?: { title?: { text?: string } } } | undefined;
  const themeId = (props?.theme as string) || "default";

  const frameProps: BaseFrameProps = {
    padding: style?.padding ? parseInt(style.padding as string) : 32,
    darkMode: (props?.darkMode as boolean) ?? true,
    transparent: (props?.transparent as boolean) ?? true,
    themeBackground: (style?.background as string) || "",
    fileName: header?.properties?.title?.text || "snippet",
    selectedLanguage: {
      name: (props?.language as string) || "TypeScript",
      value: (props?.language as string)?.toLowerCase() || "typescript",
    },
    flashShown: false,
    windowWidth,
    code: (element.content as string) || "",
    exportSize: 2,
    themeId,
    onFileNameChange: () => {},
  };

  const frameConfig = getFrameConfig(themeId);

  let FrameNode: React.ReactNode;
  if (frameConfig.Component) {
    const Comp = frameConfig.Component;
    FrameNode = <Comp {...frameProps} />;
  } else if (frameConfig.styles) {
    FrameNode = <UnifiedFrame themeStyles={frameConfig.styles} {...frameProps} />;
  } else {
    FrameNode = <DefaultFrame {...frameProps} />;
  }

  return (
    <PreviewEditorContext.Provider key={elementId} value={element}>
      {FrameNode}
    </PreviewEditorContext.Provider>
  );
}
