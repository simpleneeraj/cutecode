import styles from "./resend.module.css";
import { cn as classNames } from "@/utils/cn";
import { BaseFrameProps } from "@/typings/presets";
import sharedStyles from "../default/default.module.css";

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
