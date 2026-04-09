import React from "react";
import ThemeWrapper from "./ThemeWrapper";
import Editor from "../Editor";

import { BaseFrameProps } from "./index";

export interface UnifiedFrameProps extends BaseFrameProps {
  themeStyles: { readonly [key: string]: string };
}

const UnifiedFrame = ({ themeStyles, padding, darkMode, transparent, ...rest }: UnifiedFrameProps) => {
  return (
    <ThemeWrapper themeStyles={themeStyles} padding={padding} darkMode={darkMode} transparent={transparent}>
      <div className={themeStyles.window}>
        <Editor />
      </div>
    </ThemeWrapper>
  );
};

export default UnifiedFrame;
