import React, { useCallback } from "react";
import { Field, FieldLabel } from "@/components/ui/field";
import { Menu, MenuCheckboxItem, MenuItem, MenuPopup, MenuSeparator, MenuTrigger } from "@/components/ui/menu";
import { Settings2, Moon, Hash, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAtomValue, useSetAtom } from "jotai";
import {
  elementDarkModeAtom,
  elementShowLineNumbersAtom,
  elementTransparentAtom,
  updateSlideElementAtom,
  resetEditorAtom,
} from "@/store/editor/editor";
import useHotkeys from "@/utils/useHotkeys";
import { Icon } from "@iconify/react";

const OptionsControl: React.FC = () => {
  const updateSlideElement = useSetAtom(updateSlideElementAtom);
  const resetEditor = useSetAtom(resetEditorAtom);

  const handleReset = useCallback(() => {
    resetEditor();
  }, [resetEditor]);

  const darkMode = useAtomValue(elementDarkModeAtom);
  const transparent = useAtomValue(elementTransparentAtom);
  const showLineNumbers = useAtomValue(elementShowLineNumbersAtom);

  // Hotkeys
  useHotkeys("n", (e) => {
    e.preventDefault();
    updateSlideElement({ properties: { showLineNumbers: !showLineNumbers } });
  });

  useHotkeys("d", (e) => {
    e.preventDefault();
    updateSlideElement({ properties: { darkMode: !darkMode } });
  });

  useHotkeys("b", (e) => {
    e.preventDefault();
    updateSlideElement({ properties: { transparent: !transparent } });
  });

  return (
    <Field>
      <FieldLabel>
        <span className="text-muted-foreground text-xs">Display</span>
      </FieldLabel>

      <Menu>
        <MenuTrigger render={<Button variant="outline" size="icon" className="shadow-sm hover:shadow-md transition" />}>
          <Settings2 className="w-4 h-4" />
        </MenuTrigger>

        <MenuPopup className="w-56 p-2 space-y-1 rounded-xl">
          {/* Background */}
          <MenuCheckboxItem
            variant="switch"
            checked={!transparent}
            onCheckedChange={(checked) =>
              updateSlideElement({
                properties: { transparent: !checked },
              })
            }
            className="flex items-center justify-between gap-2 rounded-lg px-2 py-2"
          >
            <div className="flex items-center gap-2 text-sm">
              <Image className="w-4 h-4 opacity-70" />
              <span>Background</span>
            </div>
            {/* <span className="text-xs text-muted-foreground">{transparent ? "Hidden" : "Visible"}</span> */}
          </MenuCheckboxItem>

          {/* Dark Mode */}
          <MenuCheckboxItem
            variant="switch"
            checked={darkMode}
            onCheckedChange={(checked) =>
              updateSlideElement({
                properties: { darkMode: checked },
              })
            }
            className="flex items-center justify-between gap-2 rounded-lg px-2 py-2"
          >
            <div className="flex items-center gap-2 text-sm">
              <Moon className="w-4 h-4 opacity-70" />
              <span>Dark Mode</span>
            </div>
          </MenuCheckboxItem>

          {/* Line Numbers */}
          <MenuCheckboxItem
            variant="switch"
            checked={showLineNumbers}
            onCheckedChange={(checked) =>
              updateSlideElement({
                properties: { showLineNumbers: checked },
              })
            }
            className="flex items-center justify-between gap-2 rounded-lg px-2 py-2"
          >
            <div className="flex items-center gap-2 text-sm">
              <Hash className="w-4 h-4 opacity-70" />
              <span>Line Numbers</span>
            </div>
          </MenuCheckboxItem>

          <MenuSeparator />

          {/* Reset Storage */}
          <MenuItem
            onClick={handleReset}
            className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-destructive data-highlighted:bg-destructive/10 data-highlighted:text-destructive"
          >
            <Icon icon={"solar:trash-bin-trash-bold"} />
            <span>Reset Storage</span>
            <code>12KB</code>
          </MenuItem>
        </MenuPopup>
      </Menu>
    </Field>
  );
};

export default OptionsControl;
