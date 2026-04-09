import classNames from "classnames";
import { useAtom, useAtomValue , useSetAtom } from "jotai";




import mintlifyPatternDark from "../../assets/mintlify-pattern-dark.svg?url";
import mintlifyPatternLight from "../../assets/mintlify-pattern-light.svg?url";

import Editor from "../Editor";
import sharedStyles from "./DefaultFrame.module.css";
import styles from "./MintlifyFrame.module.css";
import { elementDarkModeAtom, elementFileNameAtom, elementPaddingAtom, elementTransparentAtom , updateSlideElementAtom} from "../../store/editor";


import { BaseFrameProps } from "./index";

const MintlifyFrame = ({ padding, darkMode, transparent, fileName, onFileNameChange }: BaseFrameProps) => {
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
          <img src={darkMode ? mintlifyPatternDark : mintlifyPatternLight} alt="" className={styles.pattern} />
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
        <Editor />
      </div>
    </div>
  );
};

export default MintlifyFrame;
