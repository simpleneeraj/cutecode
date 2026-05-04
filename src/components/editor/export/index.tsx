import React, { MouseEventHandler } from "react";

import download from "../util/download";
import { toPng, toSvg, toBlob } from "../lib/image";

import useHotkeys from "@/utils/useHotkeys";
import usePngClipboardSupported from "../util/usePngClipboardSupported";
import { useAtomValue, useSetAtom } from "jotai";
import { EXPORT_SIZE_OPTIONS, exportSizeAtom, fileNameAtom, currentSlideIdAtom } from "@/store/editor/editor";

import { Kbd, Kbds } from "@/components/kbd";

import { Popover, PopoverDescription, PopoverPopup, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Group } from "@/components/ui/group";
import { ChevronDownIcon, ClipboardIcon, ImageIcon, SparklesIcon } from "lucide-react";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Select, SelectItem, SelectPopup, SelectTrigger } from "@/components/ui/select";
import { HugeiconsIcon } from "@hugeicons/react";
import { Download02Icon } from "@hugeicons/core-free-icons";
import PublishSnippet from "./publish-snippet";
import { useEditorContext } from "@/store/editor/context/editor";
import { derivedFlashMessageAtom, flashShownAtom } from "@/store/editor/flash";

const ExportButton: React.FC = () => {
  const { frameRefs } = useEditorContext();
  const slideId = useAtomValue(currentSlideIdAtom);

  const getCurrentFrame = () => {
    const frame = frameRefs.current.get(slideId!);
    if (!frame) throw new Error("Couldn't find a frame to export");
    return frame;
  };

  const pngClipboardSupported = usePngClipboardSupported();
  const setFlashShown = useSetAtom(flashShownAtom);
  const customFileName = useAtomValue(fileNameAtom);
  const setCustomFileName = useSetAtom(fileNameAtom);
  const setFlashMessage = useSetAtom(derivedFlashMessageAtom);
  const exportSize = useAtomValue(exportSizeAtom);
  const setExportSize = useSetAtom(exportSizeAtom);

  const fileName = customFileName.replaceAll(" ", "-") || "cutecode-export";
  const randomNameGenerator = () => {
    return "SNIPPET" + "-" + new Date().toISOString().split("T")[0];
  };

  // ─── Image expor
  // t helpers ──────────────────────────────────────────────────

  const savePng = async () => {
    const frame = getCurrentFrame();
    setFlashMessage({ icon: <ImageIcon />, message: "Exporting PNG" });
    const dataUrl = await toPng(frame, { pixelRatio: exportSize });
    download(dataUrl, `${fileName}.png`);
    setFlashShown(false);
  };

  const copyPng = async () => {
    const frame = getCurrentFrame();
    setFlashMessage({ icon: <ClipboardIcon />, message: "Copying PNG" });
    const clipboardItem = new ClipboardItem({
      "image/png": toBlob(frame, { pixelRatio: exportSize }).then((blob) => {
        if (!blob) throw new Error("expected toBlob to return a blob");
        return blob;
      }),
    });
    await navigator.clipboard.write([clipboardItem]);
    setFlashMessage({ icon: <ClipboardIcon />, message: "PNG Copied to clipboard!", timeout: 2000 });
  };

  const saveSvg = async () => {
    const frame = getCurrentFrame();
    setFlashMessage({ icon: <ImageIcon />, message: "Exporting SVG" });
    const dataUrl = await toSvg(frame);
    download(dataUrl, `${fileName}.svg`);
    setFlashShown(false);
  };

  const handleExportClick: MouseEventHandler = (event) => {
    event.preventDefault();
    savePng();
  };

  useHotkeys("ctrl+s,cmd+s", (event) => {
    event.preventDefault();
    savePng();
  });
  useHotkeys("ctrl+c,cmd+c", (event) => {
    if (pngClipboardSupported) {
      event.preventDefault();
      copyPng();
    }
  });

  useHotkeys("ctrl+shift+c,cmd+shift+c", (event) => {
    event.preventDefault();
  });
  useHotkeys("ctrl+shift+s,cmd+shift+s", (event) => {
    event.preventDefault();
    saveSvg();
  });

  return (
    <>
      <Group aria-label="Export actions">
        <Button variant="outline" onClick={handleExportClick}>
          <HugeiconsIcon icon={Download02Icon} />
          Export
        </Button>
        <Popover>
          <PopoverTrigger render={<Button aria-label="Export options" size="icon" variant="outline" />}>
            <ChevronDownIcon aria-hidden="true" />
          </PopoverTrigger>

          <PopoverPopup className="w-80 max-w-[90vw]">
            <div className="mb-4">
              <PopoverTitle className="text-base">Export image</PopoverTitle>
              <PopoverDescription>Download or copy your code snippet as an image.</PopoverDescription>
            </div>

            <div className="flex flex-col gap-2">
              <Field>
                <FieldLabel>Name</FieldLabel>
                <Group className="w-full">
                  <Input
                    placeholder="Untitled"
                    type="text"
                    value={fileName}
                    onChange={(e) => setCustomFileName(e.target.value)}
                  />
                  <Button variant="outline" onClick={() => setCustomFileName(randomNameGenerator())}>
                    <SparklesIcon />
                  </Button>
                </Group>
                <FieldDescription>The name of the file that will be downloaded.</FieldDescription>
              </Field>
              <Field>
                <FieldLabel>Size</FieldLabel>

                <Select
                  items={EXPORT_SIZE_OPTIONS}
                  value={exportSize.toString()}
                  onValueChange={(value) => setExportSize(Number(value))}
                >
                  <SelectTrigger>{EXPORT_SIZE_OPTIONS.find((size) => size.value === exportSize)?.label}</SelectTrigger>
                  <SelectPopup>
                    {EXPORT_SIZE_OPTIONS.map((size) => (
                      <SelectItem key={size.value} value={size.value.toString()}>
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectPopup>
                </Select>
                <FieldDescription>The size of the image that will be downloaded.</FieldDescription>
              </Field>
              <Separator />
              <Button variant="ghost" onClick={savePng}>
                <ImageIcon /> Save PNG
                <Kbds>
                  <Kbd>⌘</Kbd>
                  <Kbd>S</Kbd>
                </Kbds>
              </Button>

              {/* <Button variant="ghost" onClick={saveSvg}>
                <ImageIcon /> Save SVG
                <Kbds>
                  <Kbd>⌘</Kbd>
                  <Kbd>⇧</Kbd>
                  <Kbd>S</Kbd>
                </Kbds>
              </Button> */}

              {pngClipboardSupported && (
                <Button variant="ghost" onClick={copyPng}>
                  <ClipboardIcon /> Copy Image
                  <Kbds>
                    <Kbd>⌘</Kbd>
                    <Kbd>C</Kbd>
                  </Kbds>
                </Button>
              )}
              <PublishSnippet />
            </div>
          </PopoverPopup>
        </Popover>
      </Group>
    </>
  );
};

export default ExportButton;
