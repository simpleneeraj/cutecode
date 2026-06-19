"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSetAtom } from "jotai";
import { editorAtom } from "@/store/editor/editor/core";
import { currentSlideIdAtom, currentElementIdAtom } from "@/store/editor/editor/selection";
import { useSharePreview } from "@/hooks/use-share";
import { nanoid } from "nanoid";
import { toast } from "@/components/toast";
import { cn } from "@/utils/cn";
import Frame from "@/components/editor/Frame";
import Controls from "@/components/editor/controls";

export default function RemixClient({ slug }: { slug: string }) {
  const router = useRouter();
  const { data, error, isLoading } = useSharePreview(slug);
  const setEditor = useSetAtom(editorAtom);
  const setCurrentSlideId = useSetAtom(currentSlideIdAtom);
  const setCurrentElementId = useSetAtom(currentElementIdAtom);
  const [hasRemixed, setHasRemixed] = useState(false);

  useEffect(() => {
    if (slug && !hasRemixed) {
      if (isLoading) return;

      if (error || !data?.snippet?.presentation) {
        toast.error("Could not load snippet for remixing");
        router.replace("/", { scroll: false });
        setHasRemixed(true);
        return;
      }

      const presentation = data.snippet.presentation as any;
      if (presentation.slides && presentation.elements) {
        const oldElements = presentation.elements;
        const newElements: Record<string, any> = {};
        const oldToNewId: Record<string, string> = {};

        for (const [oldId, el] of Object.entries(oldElements)) {
          const newId = nanoid();
          oldToNewId[oldId] = newId;
          newElements[newId] = { ...(el as any), id: newId };
        }

        const oldSlideElements = presentation.slideElements ?? {};
        const newSlideElements: Record<string, string[]> = {};

        for (const [slideId, elIds] of Object.entries(oldSlideElements)) {
          newSlideElements[slideId] = (elIds as string[]).map((id: string) => oldToNewId[id] || id);
        }

        setEditor({
          slides: presentation.slides,
          elements: newElements,
          slideElements: newSlideElements,
        });

        // Set the active selection to the newly generated element so the editor shows it
        const firstSlideId = Object.keys(presentation.slides)[0];
        if (firstSlideId) {
          setCurrentSlideId(firstSlideId);
          const firstElementId = newSlideElements[firstSlideId]?.[0];
          if (firstElementId) {
            setCurrentElementId(firstElementId);
          }
        }

        toast.success("Snippet loaded for remixing");
        setHasRemixed(true);
      }
    }
  }, [slug, data, error, isLoading, setEditor, setCurrentSlideId, setCurrentElementId, router, hasRemixed]);

  if (!hasRemixed) {
    return (
      <div className="h-full w-full layout-fill flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground text-sm font-medium">Preparing snippet for remix...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("app-code", "layout-scroll")}>
      <Frame />
      <Controls />
    </div>
  );
}
