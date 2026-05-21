import React from "react";
import { cn as classNames } from "@/utils/cn";
import { BaseFrameProps } from "@/typings/presets";
import styles from "./browserbase.module.css";
import sharedStyles from "../default/default.module.css";

const BrowserbaseFrame = ({ padding, darkMode, transparent, fileName, onFileNameChange, children }: BaseFrameProps) => {
  return (
    <div
      className={classNames(
        sharedStyles.frame,
        !transparent && styles.frame,
        !darkMode && styles.frameLightMode,
        transparent && sharedStyles.noBackground,
        transparent && styles.noBackground,
      )}
      style={{ padding }}
    >
      {transparent && <div data-ignore-in-export className={sharedStyles.transparentPattern}></div>}
      {!transparent && (
        <div className={styles.background}>
          <div className={styles.backgroundGridline}></div>
          <div className={styles.backgroundGridline}></div>
          <div className={styles.backgroundGridline}></div>
          <div className={styles.backgroundGridline}></div>
          <div className={styles.backgroundGridline}></div>
          <div className={styles.backgroundGridline}></div>
          <div className={styles.backgroundGridline}></div>
        </div>
      )}
      <div className={styles.window}>
        <div className={classNames(sharedStyles.header, styles.header)}>
          <div className={sharedStyles.controls}>
            <div className={sharedStyles.control}></div>
            <div className={sharedStyles.control}></div>
            <div className={sharedStyles.control}></div>
          </div>
          <div className={sharedStyles.fileName}>
            <input
              type="text"
              value={fileName}
              onChange={(event) => onFileNameChange(event.target.value)}
              spellCheck={false}
              tabIndex={-1}
            />
            {fileName.length === 0 ? <span data-ignore-in-export>Untitled-1</span> : null}
          </div>
          <div />
        </div>
        {children}
      </div>
      <div className={styles.outline} style={{ "--padding": `${padding}px` } as React.CSSProperties}></div>
    </div>
  );
};

export default BrowserbaseFrame;
