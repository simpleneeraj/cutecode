import { Card, CardPanel } from "@/components/ui/card";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination";
import { useAtomValue, useSetAtom } from "jotai";
import { currentSlideIdAtom, selectSlideAtom, slidesAtom } from "../../../store/editor";
import useHotkeys from "@/utils/useHotkeys";

type SliderControlProps = {};

const SliderControl: React.FC<SliderControlProps> = ({}) => {
  const slides = useAtomValue(slidesAtom);
  const selectSlide = useSetAtom(selectSlideAtom);
  const slideId = useAtomValue(currentSlideIdAtom);

  const currentIndex = slides.findIndex((s) => s.id === slideId);

  useHotkeys("arrowleft", () => {
    if (currentIndex > 0) selectSlide(slides[currentIndex - 1].id);
  });

  useHotkeys("arrowright", () => {
    if (currentIndex < slides.length - 1) selectSlide(slides[currentIndex + 1].id);
  });

  return (
    <Card className="bg-card/75 backdrop-blur-3xl">
      <CardPanel className="flex flex-row gap-3 p-1">
        <Pagination>
          <PaginationContent>
            {slides.map((slide, index) => (
              <PaginationItem key={slide.id} onClick={() => selectSlide(slide.id)}>
                <PaginationLink
                  id={`#slide-${index + 1}`}
                  isActive={slideId === slide.id}
                  className="text-muted-foreground"
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
          </PaginationContent>
        </Pagination>
      </CardPanel>
    </Card>
  );
};

export default SliderControl;
