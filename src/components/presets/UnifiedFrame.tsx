import ThemeWrapper from "./ThemeWrapper";
import { BaseFrameProps } from "@/typings/presets";

export interface UnifiedFrameProps extends BaseFrameProps {
  themeStyles: { readonly [key: string]: string };
}

const UnifiedFrame = ({ themeStyles, padding, darkMode, transparent, children, ...rest }: UnifiedFrameProps) => {
  return (
    <ThemeWrapper themeStyles={themeStyles} padding={padding} darkMode={darkMode} transparent={transparent}>
      <div className={themeStyles.window}>{children}</div>
    </ThemeWrapper>
  );
};

export default UnifiedFrame;
