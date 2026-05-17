"use client";

import { ChevronsUpDownIcon, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
  ComboboxTrigger,
  ComboboxValue,
} from "@/components/ui/combobox";
import fonts from "@/fonts/editor/fonts";
import { Field, FieldLabel } from "@/components/ui/field";
import { useAtomValue, useSetAtom } from "jotai";
import { currentElementAtom, updateSlideElementAtom } from "@/store/editor/editor";
import { BadgeVariant } from "@/typings/editor";
import { AccessLevel } from "@/typings/enums";
import { usePremiumAccess } from "@/hooks/use-premium-access";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@iconify/react";
import View from "@/components/view";
import { trackEditor } from "@/lib/analytics";

type FontFaceItem = {
  name: string;
  src?: string;
  variable: string;
  tags?: BadgeVariant[];
};

export default function FontFaceControl() {
  const elementState = useAtomValue(currentElementAtom);
  const updateSlideElement = useSetAtom(updateSlideElementAtom);
  const { checkAccess, withAccess } = usePremiumAccess();

  const fontFamily = elementState?.style?.fontFamily;
  const currentFont = fonts.find((f) => f.name === fontFamily) ?? null;

  const onValueChange = (font: FontFaceItem | null) => {
    if (!font) return;
    const isPremium = font.tags?.includes(BadgeVariant.PREMIUM) ?? false;
    const access = checkAccess(isPremium);
    withAccess(access, () => {
      updateSlideElement({ style: { fontFamily: font.name } });
      trackEditor.fontChanged(font.name, isPremium);
    });
  };

  return (
    <Field>
      <FieldLabel>
        <span className="text-muted-foreground text-xs">Font Face</span>
      </FieldLabel>
      <Combobox<FontFaceItem>
        value={currentFont}
        onValueChange={onValueChange}
        itemToStringLabel={(item) => item?.name ?? ""}
        items={fonts}
      >
        <ComboboxTrigger
          className="min-w-36"
          render={<Button className="justify-between font-normal" variant="outline" />}
        >
          <ComboboxValue placeholder="Select font">
            {(font) => {
              if (!font) return null;
              const isPremium = font.tags?.includes(BadgeVariant.PREMIUM) ?? false;
              const access = checkAccess(isPremium);
              return (
                <View className="flex flex-row items-center gap-2">
                  <span className="flex-1">{font.name}</span>
                  {isPremium && (
                    <Badge
                      size="sm"
                      title="Premium font"
                      className="text-xs"
                      variant={access === AccessLevel.ALLOWED ? "outline" : "warning"}
                    >
                      <Icon icon={"solar:crown-bold"} className="size-3" />
                    </Badge>
                  )}
                </View>
              );
            }}
          </ComboboxValue>
          <ChevronsUpDownIcon className="-me-1!" />
        </ComboboxTrigger>
        <ComboboxPopup aria-label="Select font face">
          <div className="border-b p-2">
            <ComboboxInput
              className="rounded-md before:rounded-[calc(var(--radius-md)-1px)]"
              placeholder="Search fonts..."
              showTrigger={false}
              startAddon={<SearchIcon />}
            />
          </div>
          <ComboboxEmpty>No fonts found.</ComboboxEmpty>
          <ComboboxList>
            {(font) => {
              const isPremium = font.tags?.includes(BadgeVariant.PREMIUM) ?? false;
              const access = checkAccess(isPremium);
              const isLocked = access !== AccessLevel.ALLOWED;

              return (
                <ComboboxItem key={font.variable} value={font}>
                  <View className="flex items-center gap-1">
                    <span className="flex-1">{font.name}</span>
                    {isPremium && (
                      <Badge
                        size="sm"
                        title="Premium font"
                        className="text-xs"
                        variant={access === AccessLevel.ALLOWED ? "outline" : "warning"}
                      >
                        <Icon icon={"solar:crown-bold"} className="size-3" />
                      </Badge>
                    )}
                  </View>
                </ComboboxItem>
              );
            }}
          </ComboboxList>
        </ComboboxPopup>
      </Combobox>
    </Field>
  );
}
