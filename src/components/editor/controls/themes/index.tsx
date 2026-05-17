import { useAtomValue } from "jotai";
import React, { useMemo } from "react";
import { Icon } from "@iconify/react";
import {
  Combobox,
  ComboboxTrigger,
  ComboboxList,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxItem,
  ComboboxSeparator,
  ComboboxValue,
  ComboboxEmpty,
  ComboboxPopup,
  ComboboxCollection,
  ComboboxInput,
} from "@/components/ui/combobox";
import { ChevronsUpDownIcon, SearchIcon } from "lucide-react";
import { Theme, IconType, BadgeVariant } from "@/typings/editor";
import { Field, FieldLabel } from "@/components/ui/field";
import { elementThemeAtom, updateSlideElementAtom } from "@/store/editor/editor";
import { cn } from "@/utils/cn";
import { useSetAtom } from "jotai";
import View from "@/components/view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { themes } from "@/components/presets/themes";
import { usePremiumAccess } from "@/hooks/use-premium-access";
import { groupThemes } from "@/components/presets/themes/shared";
import { AccessLevel } from "@/typings/enums";
import { trackEditor } from "@/lib/analytics";

interface ThemeIconProps {
  theme: Theme;
  className?: string;
}

function ThemeIcon({ theme, className }: ThemeIconProps) {
  if (!theme.icon) {
    return (
      <div
        className={cn("rounded-full", className)}
        style={{
          backgroundImage: `linear-gradient(140deg, ${theme?.background?.from}, ${theme?.background?.to})`,
        }}
      />
    );
  }
  if (theme.icon.type === IconType.IMAGE) {
    return <img src={theme.icon.source} alt={`${theme.name} icon`} className={className} />;
  }
  return <Icon icon={theme.icon.source} className={className} />;
}

function Badges({ tags, access }: { tags?: Theme["tags"]; access: AccessLevel }) {
  return (
    <>
      {tags?.includes(BadgeVariant.NEW) && (
        <Badge className="text-xs" size="sm" variant="info">
          {BadgeVariant.NEW}
        </Badge>
      )}
      {tags?.includes(BadgeVariant.POPULAR) && (
        <Badge className="text-xs" size="sm" variant="error">
          <Icon icon="solar:fire-bold" className="size-3" />
          {BadgeVariant.POPULAR}
        </Badge>
      )}
      {tags?.includes(BadgeVariant.PREMIUM) && (
        <Badge size="sm" variant={access === AccessLevel.ALLOWED ? "outline" : "warning"} title={BadgeVariant.PREMIUM}>
          <Icon icon={"solar:crown-bold"} className="size-3" />
        </Badge>
      )}
    </>
  );
}

const ThemeControl: React.FC = () => {
  const update = useSetAtom(updateSlideElementAtom);
  const themeId = useAtomValue(elementThemeAtom);

  const groupedThemes = useMemo(() => groupThemes(themes), []);
  const allThemes = useMemo(() => Object.values(themes), []);
  const currentTheme = useMemo(() => allThemes.find((t) => t.id === themeId) ?? allThemes[0], [themeId, allThemes]);

  const { checkAccess, withAccess } = usePremiumAccess();

  const onValueChange = (theme: Theme | null) => {
    if (!theme) return;
    const isPremium = theme.tags?.includes(BadgeVariant.PREMIUM) ?? false;
    const access = checkAccess(isPremium);
    withAccess(access, () => {
      update({ properties: { theme: theme.id } });
      trackEditor.themeChanged(theme.id, isPremium);
    });
  };
  return (
    <Field>
      <FieldLabel>
        <span className="text-muted-foreground text-xs">Theme</span>
      </FieldLabel>
      <Combobox<Theme>
        items={groupedThemes}
        value={currentTheme}
        onValueChange={onValueChange}
        itemToStringLabel={(theme) => theme?.name ?? ""}
        isItemEqualToValue={(item, selected) => item.id === selected.id}
      >
        <ComboboxTrigger
          render={<Button className="min-w-14 justify-between font-normal" variant="outline" />}
          className="max-w-sm"
        >
          <ComboboxValue>
            {(theme) => (
              <div className="flex items-center gap-2">
                <ThemeIcon theme={theme} className="size-3.5" />
                {/* {theme.name} */}
              </div>
            )}
          </ComboboxValue>
          <ChevronsUpDownIcon className="-me-1!" />
        </ComboboxTrigger>
        <ComboboxPopup aria-label="Select theme">
          <div className="border-t p-2">
            <ComboboxInput
              className="rounded-md before:rounded-[calc(var(--radius-md)-1px)]"
              placeholder="Search themes..."
              showTrigger={false}
              startAddon={<SearchIcon />}
            />
          </div>
          <ComboboxEmpty>No themes found.</ComboboxEmpty>
          <ComboboxList>
            {(group) => (
              <React.Fragment key={group.value}>
                <ComboboxGroup items={group.items}>
                  <ComboboxGroupLabel>{group.value}</ComboboxGroupLabel>
                  <ComboboxCollection>
                    {(theme) => {
                      const isPremium = theme.tags?.includes(BadgeVariant.PREMIUM) ?? false;
                      return (
                        <ComboboxItem key={theme.id} value={theme}>
                          <View className="flex flex-row items-center gap-2 text-start">
                            <ThemeIcon theme={theme} className="size-3.5" />
                            {theme.name}
                            <Badges tags={theme?.tags} access={checkAccess(isPremium)} />
                          </View>
                        </ComboboxItem>
                      );
                    }}
                  </ComboboxCollection>
                  {group?.separator && <ComboboxSeparator />}
                </ComboboxGroup>
              </React.Fragment>
            )}
          </ComboboxList>
        </ComboboxPopup>
      </Combobox>
    </Field>
  );
};

export default ThemeControl;
