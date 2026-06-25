"use client";

import {
  Drawer,
  DrawerHeader,
  DrawerPanel,
  DrawerPopup,
  DrawerTitle,
  DrawerTrigger,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Select, SelectItem, SelectPopup, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider, SliderValue } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Palette } from "@solar-icons/react";
import { COLORS } from "../../../../../features/share/colors";
import { PATTERNS, PATTERN_SIZE } from "../../../../../features/share/patterns";
import { useWallpaperOptions } from "../hooks/use-wallpaper-options";
import View from "@/components/view";

export function ThemeCustomizationDrawer() {
  const { wallpaperOptions, updateWallpaperOptions, updatePatternOptions } = useWallpaperOptions();

  const selectedColorLabel = COLORS.find((c) => c.colors.join(",") === wallpaperOptions.colors.join(","))?.text ?? "";

  const resolvedPatternSize = parseInt(wallpaperOptions.pattern?.size ?? `${PATTERN_SIZE}px`);

  const resolvedPatternOpacity = Math.round((wallpaperOptions.pattern?.opacity ?? 0.3) * 100);

  return (
    <Drawer position="right">
      <DrawerTrigger render={<Button variant="outline" />}>
        <Palette weight="BoldDuotone" className="h-4 w-4" aria-hidden="true" />
      </DrawerTrigger>
      <DrawerPopup variant="inset" showCloseButton showBackdrop={false}>
        <DrawerHeader className="px-5 pt-5 pb-4">
          <DrawerTitle className="text-base font-semibold">Background</DrawerTitle>
          <DrawerDescription className="text-xs text-muted-foreground">
            Customize the wallpaper appearance.
          </DrawerDescription>
        </DrawerHeader>

        <Separator />
        <DrawerPanel>
          {/* Animation toggle */}
          <View className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Animation</p>
              <Label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={wallpaperOptions.animate}
                  onCheckedChange={(checked) => updateWallpaperOptions({ animate: !!checked })}
                />
                <span className="text-sm">Animate wallpaper</span>
              </Label>
              <Label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={wallpaperOptions.scrollAnimate}
                  onCheckedChange={(checked) => updateWallpaperOptions({ scrollAnimate: !!checked })}
                />
                <span className="text-sm">Animate on scroll</span>
              </Label>
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Mask</p>
              <Label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={wallpaperOptions.pattern?.mask}
                  onCheckedChange={(checked) => updatePatternOptions({ mask: !!checked })}
                />
                <span className="text-sm">Apply mask</span>
              </Label>
            </div>
            <Separator />
            {/* Colors */}
            <div className="flex flex-col gap-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Colors</p>
              <Field>
                <FieldLabel>Color Palette</FieldLabel>
                <Select
                  items={COLORS.map(({ text, colors }) => ({
                    label: text,
                    value: colors.join(","),
                  }))}
                  value={selectedColorLabel}
                  onValueChange={(value) => updateWallpaperOptions({ colors: value?.split(",") ?? [] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectPopup>
                    {COLORS.map(({ text, colors }) => (
                      <SelectItem key={text} value={colors.join(",")}>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">
                            {colors.slice(0, 4).map((color) => (
                              <span
                                key={color}
                                className="h-3 w-3 rounded-full border border-border/50"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                          {text}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectPopup>
                </Select>
              </Field>
            </div>
            <Separator />
            {/* Pattern */}
            <div className="flex flex-col gap-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pattern</p>
              <Field>
                <FieldLabel>Pattern Style</FieldLabel>
                <Select
                  items={PATTERNS.map(({ text, path }) => ({ label: text, value: path }))}
                  value={wallpaperOptions.pattern?.image}
                  onValueChange={(value) => updatePatternOptions({ image: value! })}
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
                <Slider
                  value={[resolvedPatternSize]}
                  min={200}
                  max={500}
                  step={10}
                  onValueChange={(val) => updatePatternOptions({ size: `${val}px` })}
                >
                  <div className="mb-2 flex items-center justify-between gap-1">
                    <FieldLabel className="font-medium text-sm">Pattern Size</FieldLabel>
                    <SliderValue />
                  </div>
                </Slider>
              </Field>

              <Field>
                <Slider
                  value={[resolvedPatternOpacity]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(val) => updatePatternOptions({ opacity: Number(val) / 100 })}
                >
                  <div className="mb-2 flex items-center justify-between gap-1">
                    <FieldLabel className="font-medium text-sm">Opacity</FieldLabel>
                    <SliderValue />
                  </div>
                </Slider>
              </Field>

              <Field>
                <Slider
                  disabled={wallpaperOptions.pattern?.mask}
                  value={[wallpaperOptions.pattern?.blur ?? 0]}
                  min={0}
                  max={20}
                  step={1}
                  onValueChange={(val) => updatePatternOptions({ blur: Number(val) })}
                >
                  <div className="mb-2 flex items-center justify-between gap-1">
                    <FieldLabel className="font-medium text-sm">Blur</FieldLabel>
                    <SliderValue />
                  </div>
                </Slider>
              </Field>
            </div>
          </View>
        </DrawerPanel>
      </DrawerPopup>
    </Drawer>
  );
}
