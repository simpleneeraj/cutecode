import React from "react";
import classNames from "classnames";
import { BaseFrameProps } from "@/typings/presets";
import sharedStyles from "@/styles/presets/DefaultFrame.module.css";

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
  const showBackground = transparent;

  return (
    <div
      className={classNames(
        sharedStyles.frame,
        showBackground && themeStyles.frame,
        !darkMode && themeStyles.frameLightMode,
        !showBackground && sharedStyles.noBackground,
        !showBackground && themeStyles.noBackground,
      )}
      style={{ padding, "--padding": `${padding}px` } as React.CSSProperties}
    >
      {!showBackground && !suppressPattern && (
        <div data-ignore-in-export className={sharedStyles.transparentPattern}></div>
      )}
      {children}
    </div>
  );
};

export default ThemeWrapper;
