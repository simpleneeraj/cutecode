import React, { MouseEventHandler } from "react";
import { trackExport } from "@/lib/analytics";

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
import { ChevronDownIcon, SparklesIcon } from "lucide-react";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Select, SelectItem, SelectPopup, SelectTrigger } from "@/components/ui/select";
import { HugeiconsIcon } from "@hugeicons/react";
import { Download02Icon } from "@hugeicons/core-free-icons";
import PublishSnippet from "./publish-snippet";
import { useEditorContext } from "@/store/editor/context/editor";
import { toast } from "@/components/toast";
import { usePremiumAccess } from "@/hooks/use-premium-access";
import { AccessLevel } from "@/typings/enums";
import { Icon } from "@iconify/react";
import View from "@/components/view";
import { Badge } from "@/components/ui/badge";
import { BadgeVariant } from "@/typings/editor";

const PREMIUM_SIZE_VALUES = [4, 6];

const ExportButton: React.FC = () => {
  const { frameRefs } = useEditorContext();
  const slideId = useAtomValue(currentSlideIdAtom);

  const getCurrentFrame = () => {
    const frame = frameRefs.current.get(slideId!);
    if (!frame) throw new Error("Couldn't find a frame to export");
    return frame;
  };

  const pngClipboardSupported = usePngClipboardSupported();
  const customFileName = useAtomValue(fileNameAtom);
  const setCustomFileName = useSetAtom(fileNameAtom);
  const exportSize = useAtomValue(exportSizeAtom);
  const setExportSize = useSetAtom(exportSizeAtom);
  const { checkAccess, withAccess } = usePremiumAccess();

  const fileName = customFileName.replaceAll(" ", "-") || "cutecode-export";
  const randomNameGenerator = () => {
    return "SNIPPET" + "-" + new Date().toISOString().split("T")[0];
  };

  const savePng = async () => {
    const frame = getCurrentFrame();
    const toastId = toast.loading("Exporting PNG…");
    const dataUrl = await toPng(frame, { pixelRatio: exportSize });
    download(dataUrl, `${fileName}.png`);
    toast.dismiss(toastId);
    trackExport.pngSaved(fileName, exportSize);
  };

  const copyPng = async () => {
    const frame = getCurrentFrame();
    const toastId = toast.loading("Copying PNG…");
    const clipboardItem = new ClipboardItem({
      "image/png": toBlob(frame, { pixelRatio: exportSize }).then((blob) => {
        if (!blob) throw new Error("expected toBlob to return a blob");
        return blob;
      }),
    });
    await navigator.clipboard.write([clipboardItem]);
    toast.success("PNG copied to clipboard!", { id: toastId });
    trackExport.pngCopied(exportSize);
  };

  const saveSvg = async () => {
    const frame = getCurrentFrame();
    const toastId = toast.loading("Exporting SVG…");
    const dataUrl = await toSvg(frame);
    download(dataUrl, `${fileName}.svg`);
    toast.dismiss(toastId);
    trackExport.svgSaved(fileName);
  };

  const handleExportClick: MouseEventHandler = (event) => {
    event.preventDefault();
    savePng();
  };

  const onValueChange = (value: string | null) => {
    const numValue = Number(value);
    const isPremium = PREMIUM_SIZE_VALUES.includes(numValue);
    const access = checkAccess(isPremium);
    withAccess(access, () => {
      setExportSize(numValue);
      trackExport.sizeChanged(numValue, isPremium);
    });
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
        <Separator orientation="vertical" />
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
                <Select items={EXPORT_SIZE_OPTIONS} value={exportSize.toString()} onValueChange={onValueChange}>
                  <SelectTrigger>
                    {(() => {
                      const current = EXPORT_SIZE_OPTIONS.find((s) => s.value === exportSize);
                      const isPremium = PREMIUM_SIZE_VALUES.includes(exportSize);
                      const access = checkAccess(isPremium);

                      return (
                        <span className="flex items-center gap-2">
                          {current?.label}
                          {isPremium && (
                            <Badge
                              size="sm"
                              variant={access === AccessLevel.ALLOWED ? "outline" : "warning"}
                              title={BadgeVariant.PREMIUM}
                            >
                              <Icon icon="solar:crown-bold" className="size-3" />
                            </Badge>
                          )}
                        </span>
                      );
                    })()}
                  </SelectTrigger>
                  <SelectPopup>
                    {EXPORT_SIZE_OPTIONS.map((size) => {
                      const isPremium = PREMIUM_SIZE_VALUES.includes(size.value);
                      const access = checkAccess(isPremium);
                      const isLocked = access !== AccessLevel.ALLOWED;

                      return (
                        <SelectItem key={size.value} value={size.value.toString()}>
                          <View className="flex items-center justify-between w-full">
                            <span>{size.label}</span>
                            {isPremium && (
                              <Badge
                                size="sm"
                                variant={access === AccessLevel.ALLOWED ? "outline" : "warning"}
                                title={BadgeVariant.PREMIUM}
                              >
                                <Icon icon={"solar:crown-bold"} className="size-3" />
                              </Badge>
                            )}
                          </View>
                        </SelectItem>
                      );
                    })}
                  </SelectPopup>
                </Select>
                <FieldDescription>The size of the image that will be downloaded.</FieldDescription>
              </Field>

              <Separator />

              <Button variant="ghost" onClick={savePng}>
                <Icon icon="solar:gallery-download-bold" className="size-4" />
                Save PNG
                <Kbds>
                  <Kbd>⌘</Kbd>
                  <Kbd>S</Kbd>
                </Kbds>
              </Button>

              {pngClipboardSupported && (
                <Button variant="ghost" onClick={copyPng}>
                  <Icon icon="solar:copy-bold" className="size-4" />
                  Copy Image
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
