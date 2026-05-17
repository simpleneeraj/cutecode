import { motion, AnimatePresence } from "framer-motion";
import { useAtomValue, useSetAtom } from "jotai";
import { useRef } from "react";
import { Card, CardPanel } from "@/components/ui/card";
import { currentSlideIdAtom, selectSlideAtom, slidesAtom } from "@/store/editor/editor";

const SliderControl: React.FC = () => {
  const slides = useAtomValue(slidesAtom);
  const selectSlide = useSetAtom(selectSlideAtom);
  const slideId = useAtomValue(currentSlideIdAtom);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentIndex = slides.findIndex((s) => s.id === slideId);

  if (slides.length <= 1) return null;

  return (
    <Card className="border-none shadow-none bg-background">
      <CardPanel className="p-1 px-2">
        <div ref={containerRef} role="tablist" aria-label="Slides" className="flex items-center gap-1.5">
          {slides.map((slide, index) => {
            const isActive = slideId === slide.id;
            const isPast = index < currentIndex;

            return (
              <button
                key={slide.id}
                role="tab"
                aria-selected={isActive}
                aria-label={`Go to slide ${index + 1}`}
                onClick={() => selectSlide(slide.id)}
                className="relative flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30 rounded-full cursor-pointer border-none bg-transparent p-0"
              >
                <motion.div
                  layout
                  animate={{
                    width: isActive ? 28 : 8,
                    height: 8,
                    opacity: isPast ? 0.55 : isActive ? 1 : 0.35,
                  }}
                  transition={{
                    layout: { type: "spring", stiffness: 500, damping: 35 },
                    opacity: { duration: 0.2 },
                    width: { type: "spring", stiffness: 500, damping: 35 },
                  }}
                  className={`
                    rounded-full
                    ${
                      isActive
                        ? "bg-foreground/70"
                        : isPast
                          ? "bg-foreground/40 hover:bg-foreground/55"
                          : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    }
                  `}
                />

                {/* Animated fill for active pill */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      key="active-fill"
                      layoutId="active-pip"
                      className="absolute inset-0 rounded-full bg-foreground/20"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                </AnimatePresence>
              </button>
            );
          })}

          {/* Slide counter */}
          <AnimatePresence mode="wait">
            <motion.span
              key={currentIndex}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="ml-1.5 text-xxs tabular-nums text-muted-foreground/60 select-none"
              aria-live="polite"
              aria-atomic="true"
            >
              {currentIndex + 1}/{slides.length}
            </motion.span>
          </AnimatePresence>
        </div>
      </CardPanel>
    </Card>
  );
};

export default SliderControl;
