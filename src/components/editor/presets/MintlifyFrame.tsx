import classNames from "classnames";
import { BaseFrameProps } from "@/typings/presets";
import styles from "@/styles/presets/MintlifyFrame.module.css";
import sharedStyles from "@/styles/presets/DefaultFrame.module.css";

const MINTLIFY_PATTERN_DARK = "/editor/assets/mintlify-pattern-dark.svg";
const MINTLIFY_PATTERN_LIGHT = "/editor/assets/mintlify-pattern-light.svg";

const MintlifyFrame = ({ padding, darkMode, transparent, fileName, onFileNameChange, children }: BaseFrameProps) => {
  const showBackground = transparent;

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
    >
      {!showBackground && <div data-ignore-in-export className={sharedStyles.transparentPattern}></div>}
      {showBackground && (
        <span className={styles.patternWrapper}>
          <img src={darkMode ? MINTLIFY_PATTERN_DARK : MINTLIFY_PATTERN_LIGHT} alt="" className={styles.pattern} />
        </span>
      )}
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
        </div>
        {children}
      </div>
    </div>
  );
};

export default MintlifyFrame;
