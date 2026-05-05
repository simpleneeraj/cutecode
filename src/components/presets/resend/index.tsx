import classNames from "classnames";
import { BaseFrameProps } from "@/typings/presets";
import styles from "./resend.module.css";
import sharedStyles from "../default/default.module.css";
import { SvgBlurBackdrop } from "../BlurBackdrop";

const ResendFrame = ({
  padding,
  darkMode,
  transparent,
  fileName,
  onFileNameChange,
  selectedLanguage,
  children,
}: BaseFrameProps) => {
  const showBackground = transparent;

  return (
    <div
      className={classNames(
        sharedStyles.frame,
        styles.frame,
        darkMode && styles.darkMode,
        showBackground && styles.withBackground,
      )}
      style={{ padding }}
    >
      {!showBackground && <div data-ignore-in-export className={sharedStyles.transparentPattern}></div>}
      <div className={styles.window}>
        {/* SVG-based blur backdrop — replaces CSS backdrop-filter for html-to-image.
             Only shown when background (transparent) is active. */}
        {showBackground && (
          <SvgBlurBackdrop
            backgroundImage={
              darkMode
                ? `url("/editor/assets/resend/resend-pattern-dark.png")`
                : `url("/editor/assets/resend/resend-pattern-light.png")`
            }
            blurAmount={3}
            tintColor={darkMode ? "hsla(0,0%,0%,0.88)" : "hsla(0,0%,100%,0.72)"}
          />
        )}
        <div className={styles.header}>
          <div className={classNames(sharedStyles.fileName, styles.fileName)} data-value={fileName}>
            <input
              type="text"
              value={fileName}
              onChange={(event) => onFileNameChange(event.target.value)}
              spellCheck={false}
              tabIndex={-1}
              size={1}
            />
            {fileName.length === 0 ? <span>Untitled-1</span> : null}
          </div>
          <span className={styles.language}>{selectedLanguage?.name}</span>
        </div>
        {children}
      </div>
    </div>
  );
};

export default ResendFrame;
