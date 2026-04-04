import React, { MouseEventHandler, useContext, useState } from "react";
import { track } from "@vercel/analytics";
import JSZip from "jszip";

import ImageIcon from "../assets/icons/image-16.svg";
import ChevronDownIcon from "../assets/icons/chevron-down-16.svg";
import ClipboardIcon from "../assets/icons/clipboard-16.svg";

import { FrameContext } from "../store/context/frame";
import { derivedFlashMessageAtom, flashShownAtom } from "../store/flash";
import { fileNameAtom } from "../store";
import download from "../util/download";
import { toPng, toSvg, toBlob } from "../lib/image";

import useHotkeys from "../../../../utils/useHotkeys";
import usePngClipboardSupported from "../util/usePngClipboardSupported";
import { useAtom, useAtomValue } from "jotai";
import { EXPORT_SIZE_OPTIONS, exportSizeAtom } from "../store/image";
import { autoDetectLanguageAtom, selectedLanguageAtom } from "../store/code";
import { LANGUAGES } from "../util/languages";
import { slidesAtom } from "../store/editor";

import { Kbd, Kbds } from "@/components/kbd";

import {
  Popover,
  PopoverDescription,
  PopoverPopup,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Group } from "@/components/ui/group";
import {
  LinkIcon,
  SparklesIcon,
  Lock,
  FolderArchive,
  CheckSquare,
  Square,
  Loader2,
  Archive,
} from "lucide-react";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
} from "@/components/ui/select";
import { HugeiconsIcon } from "@hugeicons/react";
import { Download02Icon } from "@hugeicons/core-free-icons";
import { currentSlideIdAtom, selectSlideAtom } from "../store/editor";

/* ── Waits N animation frames so React + framer-motion settle ─── */
function waitFrames(n = 4): Promise<void> {
  return new Promise((resolve) => {
    let remaining = n;
    const tick = () => {
      if (--remaining <= 0) resolve();
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}
import { useSubscription } from "@/hooks/use-subscription";
import PlansDialog from "./PlansDialog";

const FREE_MAX_SIZE = 1;

/* ── Helper: base64 dataUrl → Uint8Array ───────────────────────── */
function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1];
  const binary = atob(base64);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return arr;
}

/* ── ZIP export section (Pro only) ─────────────────────────────── */
function ZipExportSection({
  frameRefs,
  exportSize,
  customFileName,
  onFlash,
}: {
  frameRefs: React.MutableRefObject<Map<string, HTMLDivElement | null>>;
  exportSize: number;
  customFileName: string;
  onFlash: (msg: string) => void;
}) {
  const slides = useAtomValue(slidesAtom) ?? [];
  const currentSlideId = useAtomValue(currentSlideIdAtom);
  const [, selectSlide] = useAtom(selectSlideAtom);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [mode, setMode] = useState<"all" | "pick">("all");

  const toggleSlide = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === slides.length) setSelected(new Set());
    else setSelected(new Set(slides.map((s) => s.id)));
  };

  const buildZip = async (slideIds: string[]) => {
    if (isExporting || slideIds.length === 0) return;
    const originalId = currentSlideId;
    setIsExporting(true);
    setProgress({ done: 0, total: slideIds.length });
    onFlash(`Exporting ${slideIds.length} slides…`);

    try {
      const zip = new JSZip();

      for (let i = 0; i < slideIds.length; i++) {
        const id = slideIds[i];
        const slide = slides.find((s) => s.id === id);
        const name = slide?.name
          ? slide.name.replace(/[^a-z0-9_\-]/gi, "-").toLowerCase()
          : `slide-${i + 1}`;

        // Switch to this slide so its frame mounts in the DOM
        await selectSlide(id);
        // Wait for React re-render + framer-motion AnimatePresence
        await waitFrames(4);

        const frame = frameRefs.current.get(id);
        if (!frame) {
          console.warn(`Frame missing for slide "${name}" — skipping`);
          setProgress({ done: i + 1, total: slideIds.length });
          continue;
        }

        const dataUrl = await toPng(frame, { pixelRatio: exportSize });
        zip.file(`${name}.png`, dataUrlToUint8Array(dataUrl));
        setProgress({ done: i + 1, total: slideIds.length });
      }

      // Restore the slide the user was on
      if (originalId) await selectSlide(originalId);

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = (customFileName || "cutecode-exports").replace(/\s+/g, "-") + ".zip";
      a.click();
      URL.revokeObjectURL(url);

      onFlash(`✓ Downloaded ${slideIds.length} slides as ZIP`);
    } catch (err) {
      console.error("ZIP export failed:", err);
      onFlash("Export failed — please try again");
      if (originalId) await selectSlide(originalId);
    } finally {
      setIsExporting(false);
      setProgress(null);
    }
  };

  const allIds = slides.map((s) => s.id);
  const pickedIds = allIds.filter((id) => selected.has(id));
  const allSelected = selected.size === slides.length && slides.length > 0;

  return (
    <div className="space-y-2">
      {/* Mode toggle */}
      <div className="flex items-center gap-1.5 rounded-xl bg-muted/40 border border-border/50 p-1">
        <button
          onClick={() => setMode("all")}
          className={[
            "flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition-all duration-150",
            mode === "all"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground",
          ].join(" ")}
        >
          <Archive className="size-3.5" />
          All ({slides.length})
        </button>
        <button
          onClick={() => setMode("pick")}
          className={[
            "flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition-all duration-150",
            mode === "pick"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground",
          ].join(" ")}
        >
          <CheckSquare className="size-3.5" />
          Select
        </button>
      </div>

      {/* Slide checklist — only in pick mode */}
      {mode === "pick" && slides.length > 0 && (
        <div className="rounded-xl border border-border/50 overflow-hidden">
          {/* Select all row */}
          <button
            onClick={toggleAll}
            className="w-full flex items-center gap-2 px-3 py-2 bg-muted/30 border-b border-border/40 hover:bg-muted/50 transition-colors"
          >
            {allSelected ? (
              <CheckSquare className="size-3.5 text-violet-400 shrink-0" />
            ) : (
              <Square className="size-3.5 text-muted-foreground shrink-0" />
            )}
            <span className="text-xs font-semibold">
              {allSelected ? "Deselect all" : "Select all"}
            </span>
            {selected.size > 0 && (
              <span className="ml-auto text-[10px] text-muted-foreground">
                {selected.size} selected
              </span>
            )}
          </button>

          {/* Slide rows */}
          <div className="max-h-36 overflow-y-auto">
            {slides.map((slide, i) => {
              const isChecked = selected.has(slide.id);
              return (
                <button
                  key={slide.id}
                  onClick={() => toggleSlide(slide.id)}
                  className={[
                    "w-full flex items-center gap-2 px-3 py-2 text-left transition-colors",
                    "border-b border-border/30 last:border-0",
                    isChecked
                      ? "bg-violet-500/5 hover:bg-violet-500/8"
                      : "hover:bg-muted/30",
                  ].join(" ")}
                >
                  {isChecked ? (
                    <CheckSquare className="size-3.5 text-violet-400 shrink-0" />
                  ) : (
                    <Square className="size-3.5 text-muted-foreground/50 shrink-0" />
                  )}
                  <span className="text-xs truncate flex-1">
                    {slide.name || `Slide ${i + 1}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Export CTA */}
      <button
        disabled={
          isExporting ||
          slides.length === 0 ||
          (mode === "pick" && pickedIds.length === 0)
        }
        onClick={() =>
          buildZip(mode === "all" ? allIds : pickedIds)
        }
        className={[
          "relative w-full flex items-center justify-center gap-2",
          "rounded-xl px-4 py-2.5 text-sm font-bold text-white",
          "bg-linear-to-r from-violet-600 to-violet-500",
          "hover:from-violet-500 hover:to-violet-400",
          "transition-all duration-200 shadow-md shadow-violet-500/20",
          "disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group",
        ].join(" ")}
      >
        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-linear-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
        {isExporting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            {progress
              ? `Capturing ${progress.done} / ${progress.total}…`
              : "Building ZIP…"}
          </>
        ) : (
          <>
            <FolderArchive className="size-4" />
            {mode === "all"
              ? `Download all ${slides.length} as ZIP`
              : pickedIds.length > 0
              ? `Download ${pickedIds.length} selected as ZIP`
              : "Select slides above"}
          </>
        )}
      </button>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────────── */

const ExportButton: React.FC = () => {
  const frameRefs = useContext(FrameContext);
  const slideId = useAtomValue(currentSlideIdAtom);
  const { isPro } = useSubscription();

  const getCurrentFrame = () => {
    const frame = frameRefs.current.get(slideId!);
    if (!frame) throw new Error("Couldn't find a frame to export");
    return frame;
  };

  const pngClipboardSupported = usePngClipboardSupported();
  const [, setFlashMessage] = useAtom(derivedFlashMessageAtom);
  const [, setFlashShown] = useAtom(flashShownAtom);
  const [customFileName, setCustomFileName] = useAtom(fileNameAtom);
  const fileName = customFileName.replaceAll(" ", "-") || "cutecode-export";
  const [exportSize, setExportSize] = useAtom(exportSizeAtom);
  const selectedLanguage = useAtomValue(selectedLanguageAtom);
  const autoDetectLanguage = useAtomValue(autoDetectLanguageAtom);

  const effectiveExportSize = isPro ? exportSize : FREE_MAX_SIZE;

  const randomNameGenerator = () =>
    "IMAGE" + "-" + new Date().toISOString().split("T")[0];

  const flash = (message: string) =>
    setFlashMessage({ icon: <ImageIcon />, message });

  const savePng = async () => {
    const frame = getCurrentFrame();
    flash("Exporting PNG");
    const dataUrl = await toPng(frame, { pixelRatio: effectiveExportSize });
    download(dataUrl, `${fileName}.png`);
    setFlashShown(false);
  };

  const copyPng = async () => {
    const frame = getCurrentFrame();
    flash("Copying PNG");
    const clipboardItem = new ClipboardItem({
      "image/png": toBlob(frame, { pixelRatio: effectiveExportSize }).then(
        (blob) => {
          if (!blob) throw new Error("expected toBlob to return a blob");
          return blob;
        }
      ),
    });
    await navigator.clipboard.write([clipboardItem]);
    setFlashMessage({
      icon: <ClipboardIcon />,
      message: "PNG Copied to clipboard!",
      timeout: 2000,
    });
  };

  const saveSvg = async () => {
    const frame = getCurrentFrame();
    flash("Exporting SVG");
    const dataUrl = await toSvg(frame);
    download(dataUrl, `${fileName}.svg`);
    setFlashShown(false);
  };

  const handleExportClick: MouseEventHandler = (event) => {
    event.preventDefault();
    const params = new URLSearchParams(
      window.location.hash.replace("#", "?")
    );
    track("Export", {
      theme: params.get("theme") || "candy",
      background: params.get("background") || "true",
      darkMode: params.get("darkMode") || "true",
      padding: params.get("padding") || "64",
      language:
        Object.keys(LANGUAGES).find(
          (key) => LANGUAGES[key].name === selectedLanguage?.name
        ) || "auto",
      autoDetectLanguage: autoDetectLanguage.toString(),
      title: params.get("title") || "untitled",
      width: params.get("width") || "auto",
      size: `${effectiveExportSize}x`,
    });
    savePng();
  };

  const copyUrl = async () => {
    flash("Copying URL");
    const url = window.location.toString();
    let urlToCopy = url;
    const encodedUrl = encodeURIComponent(url);
    const response = await fetch(
      `/api/shorten-url?url=${encodedUrl}&ref=codeImage`
    ).then((res) => res.json());
    if (response.link) urlToCopy = response.link;
    navigator.clipboard.writeText(urlToCopy);
    setFlashMessage({
      icon: <ClipboardIcon />,
      message: "URL Copied to clipboard!",
      timeout: 2000,
    });
  };

  useHotkeys("ctrl+s,cmd+s", (e) => { e.preventDefault(); savePng(); });
  useHotkeys("ctrl+c,cmd+c", (e) => {
    if (pngClipboardSupported) { e.preventDefault(); copyPng(); }
  });
  useHotkeys("ctrl+shift+c,cmd+shift+c", (e) => { e.preventDefault(); copyUrl(); });
  useHotkeys("ctrl+shift+s,cmd+shift+s", (e) => { e.preventDefault(); saveSvg(); });

  return (
    <Group aria-label="Export actions">
      <Button variant="outline" onClick={handleExportClick}>
        <HugeiconsIcon icon={Download02Icon} />
        Export
      </Button>

      <Popover>
        <PopoverTrigger
          render={<Button aria-label="Export options" size="icon" variant="outline" />}
        >
          <ChevronDownIcon aria-hidden="true" />
        </PopoverTrigger>

        <PopoverPopup className="w-80 max-w-[90vw]">
          <div className="mb-4">
            <PopoverTitle className="text-base">Export image</PopoverTitle>
            <PopoverDescription>
              Download or copy your code snippet as an image.
            </PopoverDescription>
          </div>

          <div className="flex flex-col gap-2">
            {/* Filename */}
            <Field>
              <FieldLabel>Name</FieldLabel>
              <Group className="w-full">
                <Input
                  placeholder="Untitled"
                  type="text"
                  value={fileName}
                  onChange={(e) => setCustomFileName(e.target.value)}
                />
                <Button
                  variant="outline"
                  onClick={() => setCustomFileName(randomNameGenerator())}
                >
                  <SparklesIcon />
                </Button>
              </Group>
              <FieldDescription>
                The name of the file that will be downloaded.
              </FieldDescription>
            </Field>

            {/* Size */}
            <Field>
              <FieldLabel className="flex items-center gap-1.5">
                Size
                {!isPro && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-violet-500/10 text-violet-400 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ring-1 ring-violet-500/25">
                    <Lock className="size-2.5" />
                    Pro
                  </span>
                )}
              </FieldLabel>

              {isPro ? (
                <>
                  <Select
                    items={EXPORT_SIZE_OPTIONS}
                    value={exportSize.toString()}
                    onValueChange={(value) => setExportSize(Number(value))}
                  >
                    <SelectTrigger>
                      {EXPORT_SIZE_OPTIONS.find((s) => s.value === exportSize)?.label}
                    </SelectTrigger>
                    <SelectPopup>
                      {EXPORT_SIZE_OPTIONS.map((size) => (
                        <SelectItem key={size.value} value={size.value.toString()}>
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectPopup>
                  </Select>
                  <FieldDescription>
                    The size of the image that will be downloaded.
                  </FieldDescription>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
                    <span className="text-sm text-muted-foreground">1× (standard)</span>
                    <PlansDialog />
                  </div>
                  <FieldDescription>
                    Upgrade to Pro for HD (2×) and 4K (4×) exports.
                  </FieldDescription>
                </>
              )}
            </Field>

            <Separator />

            {/* Single-slide actions */}
            <Button variant="ghost" onClick={savePng}>
              <ImageIcon /> Save PNG
              {!isPro && (
                <span className="ml-auto text-[9px] text-muted-foreground">1×</span>
              )}
              <Kbds>
                <Kbd>⌘</Kbd>
                <Kbd>S</Kbd>
              </Kbds>
            </Button>

            <Button variant="ghost" onClick={saveSvg}>
              <ImageIcon /> Save SVG
              <Kbds>
                <Kbd>⌘</Kbd>
                <Kbd>⇧</Kbd>
                <Kbd>S</Kbd>
              </Kbds>
            </Button>

            {pngClipboardSupported && (
              <Button variant="ghost" onClick={copyPng}>
                <ClipboardIcon /> Copy Image
                {!isPro && (
                  <span className="ml-auto text-[9px] text-muted-foreground">1×</span>
                )}
                <Kbds>
                  <Kbd>⌘</Kbd>
                  <Kbd>C</Kbd>
                </Kbds>
              </Button>
            )}

            <Button variant="ghost" onClick={copyUrl}>
              <LinkIcon /> Copy URL
              <Kbds>
                <Kbd>⌘</Kbd>
                <Kbd>⇧</Kbd>
                <Kbd>C</Kbd>
              </Kbds>
            </Button>

            {/* ── Bulk ZIP Export (Pro) ─────────────────────── */}
            <Separator />

            {isPro ? (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <FolderArchive className="size-3.5 text-violet-400" />
                  <span className="text-xs font-semibold">Bulk Export as ZIP</span>
                </div>
                <ZipExportSection
                  frameRefs={frameRefs}
                  exportSize={effectiveExportSize}
                  customFileName={customFileName}
                  onFlash={flash}
                />
              </div>
            ) : (
              <div className="rounded-xl bg-linear-to-b from-violet-500/10 via-violet-500/5 to-transparent border border-violet-500/20 px-3 py-2.5">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <FolderArchive className="size-3.5 text-violet-400" />
                  <p className="text-xs font-semibold text-violet-400">
                    Bulk Export as ZIP
                  </p>
                </div>
                <p className="text-[10px] text-muted-foreground mb-2">
                  Export all slides or pick specific ones — zipped and ready to download like Canva.
                </p>
                <PlansDialog />
              </div>
            )}
          </div>
        </PopoverPopup>
      </Popover>
    </Group>
  );
};

export default ExportButton;
