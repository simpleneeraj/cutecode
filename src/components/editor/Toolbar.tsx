"use client";

import { Button } from "@/components/ui/button";
import { AltArrowLeft, AltArrowRight, Copy, AddSquare, TrashBinTrash } from "@solar-icons/react";
import { Toolbar, ToolbarButton, ToolbarGroup } from "@/components/ui/toolbar";
import { Tooltip, TooltipPopup, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAtomValue, useSetAtom } from "jotai";
import {
  createSlideAtom,
  currentSlideIdAtom,
  deleteSlideAtom,
  duplicateSlideAtom,
  selectSlideAtom,
  slidesAtom,
} from "@/store/editor/editor";
import { Separator } from "../ui/separator";
import useHotkeys from "@/utils/useHotkeys";
import { Kbd, KbdGroup } from "../ui/kbd";
import View from "../view";

export default function ToolbarParticle() {
  const slides = useAtomValue(slidesAtom);

  const createSlide = useSetAtom(createSlideAtom);
  const duplicateSlide = useSetAtom(duplicateSlideAtom);
  const deleteSlide = useSetAtom(deleteSlideAtom);

  const selectSlide = useSetAtom(selectSlideAtom);
  const slideId = useAtomValue(currentSlideIdAtom);

  const currentIndex = slides.findIndex((s) => s.id === slideId);

  const onCreateSlide = () => {
    createSlide({
      id: crypto.randomUUID(),
      name: "New Slide",
      background: {},
    });
  };

  const previousSlide = () => {
    if (currentIndex > 0) {
      selectSlide(slides[currentIndex - 1].id);
    }
  };

  const nextSlide = () => {
    if (currentIndex < slides.length - 1) {
      selectSlide(slides[currentIndex + 1].id);
    }
  };

  /**
   * Hotkeys
   */

  useHotkeys("shift+left", previousSlide);
  useHotkeys("shift+right", nextSlide);

  useHotkeys("a", onCreateSlide);

  useHotkeys("d", duplicateSlide);

  useHotkeys("shift+backspace", () => {
    if (slides.length > 1) {
      deleteSlide();
    }
  });

  return (
    <TooltipProvider>
      <Toolbar>
        <ToolbarGroup>
          {/* Previous Slide */}
          <Tooltip>
            <TooltipTrigger
              render={
                <ToolbarButton
                  aria-label="Previous slide"
                  render={
                    <Button size="icon-sm" variant="ghost" onClick={previousSlide} disabled={currentIndex === 0} />
                  }
                >
                  <AltArrowLeft weight="Linear" className="text-accent-foreground" aria-hidden="true" />
                </ToolbarButton>
              }
            />

            <TooltipPopup sideOffset={8}>
              <View className="flex items-center gap-2">
                Previous Slide
                <KbdGroup>
                  <Kbd>Shift</Kbd>
                  <Kbd>←</Kbd>
                </KbdGroup>
              </View>
            </TooltipPopup>
          </Tooltip>

          <Separator orientation="vertical" />

          {/* Add Slide */}
          <Tooltip>
            <TooltipTrigger
              render={
                <ToolbarButton
                  aria-label="Add slide"
                  render={<Button size="icon-sm" variant="ghost" onClick={onCreateSlide} />}
                >
                  <AddSquare weight="Linear" className="text-accent-foreground" aria-hidden="true" />
                </ToolbarButton>
              }
            />

            <TooltipPopup sideOffset={8}>
              <View className="flex items-center gap-2">
                Add Slide
                <KbdGroup>
                  <Kbd>A</Kbd>
                </KbdGroup>
              </View>
            </TooltipPopup>
          </Tooltip>

          {/* Duplicate Slide */}
          <Tooltip>
            <TooltipTrigger
              render={
                <ToolbarButton
                  aria-label="Duplicate slide"
                  render={<Button size="icon-sm" variant="ghost" onClick={duplicateSlide} />}
                >
                  <Copy weight="Linear" className="text-accent-foreground" aria-hidden="true" />
                </ToolbarButton>
              }
            />

            <TooltipPopup sideOffset={8}>
              <View className="flex items-center gap-2">
                Duplicate Slide
                <KbdGroup>
                  <Kbd>D</Kbd>
                </KbdGroup>
              </View>
            </TooltipPopup>
          </Tooltip>

          {slides.length > 1 && (
            <>
              <Separator orientation="vertical" />

              {/* Delete Slide */}
              <Tooltip>
                <TooltipTrigger
                  render={
                    <ToolbarButton
                      aria-label="Delete slide"
                      render={
                        <Button size="icon-sm" variant="ghost" className="text-destructive" onClick={deleteSlide} />
                      }
                    >
                      <TrashBinTrash weight="Linear" aria-hidden="true" />
                    </ToolbarButton>
                  }
                />

                <TooltipPopup sideOffset={8}>
                  <View className="flex items-center gap-2">
                    Delete Slide
                    <KbdGroup>
                      <Kbd>Delete</Kbd>
                    </KbdGroup>
                  </View>
                </TooltipPopup>
              </Tooltip>
            </>
          )}

          <Separator orientation="vertical" />

          {/* Next Slide */}
          <Tooltip>
            <TooltipTrigger
              render={
                <ToolbarButton
                  aria-label="Next slide"
                  render={
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={nextSlide}
                      disabled={currentIndex === slides.length - 1}
                    />
                  }
                >
                  <AltArrowRight weight="Linear" className="text-accent-foreground" aria-hidden="true" />
                </ToolbarButton>
              }
            />

            <TooltipPopup sideOffset={8}>
              <View className="flex items-center gap-2">
                Next Slide
                <KbdGroup>
                  <Kbd>Shift</Kbd>
                  <Kbd>→</Kbd>
                </KbdGroup>
              </View>
            </TooltipPopup>
          </Tooltip>
        </ToolbarGroup>
      </Toolbar>
    </TooltipProvider>
  );
}
