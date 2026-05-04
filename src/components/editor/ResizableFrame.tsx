import React, { MouseEventHandler, PropsWithChildren, useCallback, useRef, useState } from "react";
import { useAtom } from "jotai";
import { windowWidthAtom } from "@//store/editor/editor";
import { motion, AnimatePresence } from "framer-motion";
import { MAX_SLIDE_WIDTH, MIN_SLIDE_WIDTH } from "@/store/editor/editor/state";
import { XmarkIcon } from "@raycast/icons";

type Handle = "right" | "left";

const ResizableFrame: React.FC<PropsWithChildren> = ({ children }) => {
  const currentHandleRef = useRef<Handle>(undefined);
  const windowRef = useRef<HTMLDivElement>(null);
  const startWidthRef = useRef<number>(undefined);
  const startXRef = useRef<number>(undefined);
  const [windowWidth, setWindowWidth] = useAtom(windowWidthAtom);
  const [isResizing, setResizing] = useState(false);

  const mouseMoveHandler = useCallback(
    (event: MouseEvent) => {
      let newWidth;

      if (currentHandleRef.current === "left") {
        newWidth = startWidthRef.current! - (event.clientX - startXRef.current!) * 2;
      } else {
        newWidth = startWidthRef.current! + (event.clientX - startXRef.current!) * 2;
      }

      if (newWidth > MAX_SLIDE_WIDTH) {
        newWidth = MAX_SLIDE_WIDTH;
      } else if (newWidth < MIN_SLIDE_WIDTH) {
        newWidth = MIN_SLIDE_WIDTH;
      }

      setWindowWidth(newWidth);
    },
    [setWindowWidth],
  );

  const clearSelection = useCallback(() => {
    var sel = document.getSelection();
    if (sel) {
      if (sel.removeAllRanges) {
        sel.removeAllRanges();
      } else if (sel.empty) {
        sel.empty();
      }
    }
  }, []);

  const mouseUpHandler = useCallback(() => {
    document.removeEventListener("mousemove", mouseMoveHandler);
    document.removeEventListener("mouseup", mouseUpHandler);
    setResizing(false);
    clearSelection();
  }, [mouseMoveHandler, clearSelection]);

  const handleResizeFrameX = useCallback(
    (handle: Handle): MouseEventHandler<HTMLDivElement> =>
      (event) => {
        currentHandleRef.current = handle;
        startWidthRef.current = windowRef.current!.offsetWidth;
        startXRef.current = event.clientX;
        setResizing(true);

        document.addEventListener("mousemove", mouseMoveHandler);
        document.addEventListener("mouseup", mouseUpHandler);
      },
    [mouseMoveHandler, mouseUpHandler],
  );

  return (
    <div className={`relative inline-block ${isResizing ? "select-none" : ""}`}>
      <div
        className="absolute z-10 top-1/2 left-0 w-6 h-6 -translate-x-1/2 -translate-y-1/2 cursor-col-resize select-none after:absolute after:top-1/2 after:left-1/2 after:w-1.5 after:h-1.5 after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:bg-neutral-800 dark:after:bg-white after:content-['']"
        onMouseDown={handleResizeFrameX("left")}
      ></div>
      <div
        className="absolute z-10 top-1/2 right-0 w-6 h-6 translate-x-1/2 -translate-y-1/2 cursor-col-resize select-none after:absolute after:top-1/2 after:left-1/2 after:w-1.5 after:h-1.5 after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:bg-neutral-800 dark:after:bg-white after:content-['']"
        onMouseDown={handleResizeFrameX("right")}
      ></div>
      <div ref={windowRef} style={{ width: windowWidth! }}>
        {children}
      </div>

      <AnimatePresence>
        {!!(windowWidth && !isResizing) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 left-0 flex justify-center"
          >
            <a
              className="inline-flex flex-col items-center m-4 text-xxs gap-1.5 cursor-pointer text-neutral-500 hover:text-neutral-800 dark:text-white/40 dark:hover:text-white/70 transition-colors duration-200"
              onClick={(event) => {
                event.preventDefault();
                setWindowWidth(null);
              }}
            >
              <XmarkIcon />
              Set to auto width
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isResizing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 left-0 my-4 text-xxs text-center text-neutral-400 dark:text-white/30 border-r border-l border-neutral-300 dark:border-white/30 before:absolute before:-z-10 before:top-1/2 before:right-0 before:left-0 before:border-t before:border-neutral-300 dark:before:border-white/30 before:content-['']"
          >
            <span className="px-4 bg-background">{windowWidth} px</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResizableFrame;
