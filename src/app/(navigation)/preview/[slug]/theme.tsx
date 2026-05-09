import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardPanel } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Select, SelectItem, SelectPopup, SelectTrigger, SelectValue } from "@/components/ui/select";
import View from "@/components/view";
import React from "react";
import { COLORS } from "../share/colors";
import { PATTERNS } from "../share/patterns";
import { Slider, SliderValue } from "@/components/ui/slider";
import { MaskWallpaperOptions } from "@/plugings/mask-wallpaper/types";

interface ThemeCustomizationProps {
  options: MaskWallpaperOptions;
  updateOptions: (options: MaskWallpaperOptions) => void;
}

const ThemeCustomization: React.FC<ThemeCustomizationProps> = ({ options, updateOptions }) => {
  return (
    <View className="flex flex-col gap-3 flex-1 sticky top-2 self-start z-10">
      <Card className="w-full bg-background/50 backdrop-blur-lg">
        <CardPanel className="px-4 py-0">
          <Accordion className="w-full" defaultValue={["3"]}>
            <AccordionItem value="Theme Customization">
              <AccordionTrigger>Theme</AccordionTrigger>
              <AccordionPanel className="flex flex-col gap-2">
                <Label>
                  <Checkbox />
                  Animate the wallpaper
                </Label>
                <Field>
                  <FieldLabel>Colors</FieldLabel>
                  <Select
                    items={COLORS.map(({ text, colors }) => ({ label: text, value: colors.join(",") }))}
                    value={COLORS.find((c) => c.colors.join(",") === options.colors.join(","))?.text}
                    onValueChange={(value) => updateOptions({ ...options, colors: value?.split(",") || [] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectPopup>
                      {COLORS.map(({ text, colors }) => (
                        <SelectItem key={text} value={colors.join(",")}>
                          {text}
                        </SelectItem>
                      ))}
                    </SelectPopup>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>Patterns</FieldLabel>
                  <Select
                    items={PATTERNS.map(({ text, path }) => ({ label: text, value: path }))}
                    value={options?.pattern?.image}
                    onValueChange={(value) =>
                      updateOptions({ ...options, pattern: { ...options.pattern, image: value! } })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectPopup>
                      {PATTERNS.map(({ text, path }) => (
                        <SelectItem key={text} value={path}>
                          {text}
                        </SelectItem>
                      ))}
                    </SelectPopup>
                  </Select>
                </Field>
                <Field>
                  <Slider defaultValue={50}>
                    <div className="mb-2 flex items-center justify-between gap-1">
                      <FieldLabel className="font-medium text-sm">Pattern Size</FieldLabel>
                      <SliderValue />
                    </div>
                  </Slider>
                </Field>
                <Field>
                  <Slider defaultValue={50}>
                    <div className="mb-2 flex items-center justify-between gap-1">
                      <FieldLabel className="font-medium text-sm">Opacity</FieldLabel>
                      <SliderValue />
                    </div>
                  </Slider>
                </Field>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </CardPanel>
      </Card>
    </View>
  );
};

export default ThemeCustomization;
