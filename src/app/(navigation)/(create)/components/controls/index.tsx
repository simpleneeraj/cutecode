"use client";
import React from "react";
import View from "@/components/view";
import ThemeControl from "./themes";
import PaddingControl from "./padding";
import LanguageControl from "./language";
import OptionsControl from "./options";
import FontFaceControl from "./font-face";
import SliderControl from "./slide-control";
import { Card, CardPanel } from "@/components/ui/card";

const Controls: React.FC = () => {
  return (
    <div className="flex flex-col gap-2 fixed bottom-4 left-1/2 -translate-x-1/2">
      <View className="flex items-center justify-center">
        <SliderControl />
      </View>
      <div className="relative">
        <Card className="w-full bg-card/75 backdrop-blur-3xl relative">
          <CardPanel className="flex flex-row gap-3 p-3">
            <ThemeControl />
            <PaddingControl />
            <LanguageControl />
            <FontFaceControl />
            <OptionsControl />
          </CardPanel>
        </Card>
      </div>
    </div>
  );
};

export default Controls;
