import classNames from "classnames";
import useIsSafari from "../util/useIsSafari";
import { BaseFrameProps } from "@/typings/presets";
import React, { useEffect, useRef, useState } from "react";
import styles from "@/styles/presets/StripeFrame.module.css";
import sharedStyles from "@/styles/presets/DefaultFrame.module.css";

const StripeFrame = ({ padding, darkMode, transparent, code, windowWidth, children }: BaseFrameProps) => {
  const showBackground = transparent;
  const isSafari = useIsSafari();

  const windowRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [innerWindowWidth, setInnerWindowWidth] = useState(0);
  const [frameHeight, setFrameHeight] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const numberOfLines = Math.max(1, (code.match(/\n/g) || []).length + 1);

  useEffect(() => {
    const updateDimensions = () => {
      if (windowRef.current) {
        setInnerWindowWidth(windowRef.current.offsetWidth);
      }
      if (frameRef.current) {
        setFrameHeight(frameRef.current.offsetHeight);
      }
    };

    updateDimensions();

    const timeoutId = setTimeout(updateDimensions, 0);

    window.addEventListener("resize", updateDimensions);
    return () => {
      window.removeEventListener("resize", updateDimensions);
      clearTimeout(timeoutId);
    };
  }, [windowWidth, numberOfLines, padding, isTransitioning]);

  // Handle re-trigger when padding has finished changing
  useEffect(() => {
    const startId = setTimeout(() => setIsTransitioning(true), 0);
    const endId = setTimeout(() => setIsTransitioning(false), 200);
    return () => {
      clearTimeout(startId);
      clearTimeout(endId);
    };
  }, [padding]);

  return (
    <div
      className={classNames(
        sharedStyles.frame,
        showBackground && styles.frame,
        !darkMode && styles.frameLightMode,
        !showBackground && sharedStyles.noBackground,
        !showBackground && styles.noBackground,
      )}
      style={{ padding }}
      ref={frameRef}
    >
      {!showBackground && <div data-ignore-in-export className={sharedStyles.transparentPattern}></div>}
      {showBackground && (
        <div className={styles.background}>
          <div
            className={styles.backgroundGridlineContainer}
            style={{ "--window-width": `${innerWindowWidth}px` } as React.CSSProperties}
          >
            <div className={styles.backgroundGridline}></div>
            <div className={styles.backgroundGridline}></div>
            <div className={styles.backgroundGridline}></div>
            <div className={styles.backgroundGridline}></div>
            <div className={styles.backgroundGridline}></div>
          </div>

          <div className={classNames(styles.stripe)}>
            <div
              className={styles.backgroundGridlineContainer}
              style={{ "--window-width": `${innerWindowWidth}px` } as React.CSSProperties}
            >
              <div className={styles.backgroundGridline}></div>
              <div className={styles.backgroundGridline}></div>
              <div className={styles.backgroundGridline}></div>
              <div className={styles.backgroundGridline}></div>
              <div className={styles.backgroundGridline}></div>

              <div className={classNames(styles.set, frameHeight < 240 && styles.isSmall)}>
                <div className={styles.layer1} />
                <div className={styles.layer2} />
                <div className={styles.intersection} />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={classNames(styles.window, isSafari && styles.isSafari)} ref={windowRef}>
        {children}
      </div>
    </div>
  );
};

export default StripeFrame;
