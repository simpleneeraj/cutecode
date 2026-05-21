import React from "react";
import { cn as classNames } from "@/utils/cn";
import styles from "./default/default.module.css";
import { BaseFrameProps } from "@/typings/presets";

export interface ThemeWrapperProps extends Pick<BaseFrameProps, "padding" | "darkMode" | "transparent"> {
  children: React.ReactNode;
  themeStyles: { readonly [key: string]: string };
  /**
   * If true, suppresses the transparent background pattern. Defaults to false.
   */
  suppressPattern?: boolean;
}

const ThemeWrapper = ({
  children,
  themeStyles,
  suppressPattern = false,
  padding,
  darkMode,
  transparent,
}: ThemeWrapperProps) => {
  const showBackground = !transparent;

  return (
    <div
      className={classNames(
        styles.frame,
        showBackground && themeStyles?.frame,
        !darkMode && themeStyles?.frameLightMode,
        !showBackground && styles.noBackground,
        !showBackground && themeStyles?.noBackground,
      )}
      style={{ padding, "--padding": `${padding}px` } as React.CSSProperties}
    >
      {!showBackground && !suppressPattern && <div data-ignore-in-export className={styles.transparentPattern}></div>}
      {children}
    </div>
  );
};

export default ThemeWrapper;
