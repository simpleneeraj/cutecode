import Presets from "../presets";
import { cn } from "@/utils/cn";
import { useContext } from "react";
import { useAtomValue } from "jotai";
import styles from "@/styles/editor/Frame.module.css";
import ToolbarParticle from "./Toolbar";
import FlashMessage from "./FlashMessage";
import ResizableFrame from "./ResizableFrame";
import { EditorContext } from "@/store/editor/context/editor";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { currentElementAtom, currentSlideAtom } from "@/store/editor/editor";

const toolbarVariants: Variants = {
  hidden: { opacity: 0, y: -8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
  },
};

const frameInnerVariants: Variants = {
  hidden: {
    opacity: 0,
    filter: "blur(8px)",
  },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] },
  },
};

const Frame = () => {
  const { frameRefs } = useContext(EditorContext);

  const elementState = useAtomValue(currentElementAtom);
  const themeId = elementState?.properties?.theme!;
  const darkMode = (elementState?.properties?.darkMode as boolean) ?? false;

  const slide = useAtomValue(currentSlideAtom);

  return (
    <div className={cn(styles.frameContainer)} data-theme={darkMode ? "dark" : "light"}>
      <AnimatePresence mode="wait">
        {slide && (
          <motion.div
            key={slide.id}
            className="w-full flex flex-col items-center justify-center"
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div className="flex items-center justify-center mb-4" variants={toolbarVariants}>
              <ToolbarParticle />
            </motion.div>

            <motion.div variants={frameInnerVariants}>
              <ResizableFrame>
                {/* <FlashMessage /> */}
                <div
                  id="frame"
                  className={styles.outerFrame}
                  ref={(el) => {
                    frameRefs.current.set(slide.id, el);
                  }}
                >
                  <Presets id={themeId} />
                </div>
              </ResizableFrame>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Frame;
