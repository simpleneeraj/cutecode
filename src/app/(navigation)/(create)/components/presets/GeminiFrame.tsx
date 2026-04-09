import classNames from "classnames";
import { useAtom, useAtomValue , useSetAtom } from "jotai";


import { flashShownAtom } from "../../store/flash";


import useIsSafari from "../../util/useIsSafari";

import Editor from "../Editor";
import sharedStyles from "./DefaultFrame.module.css";
import styles from "./GeminiFrame.module.css";
import { elementDarkModeAtom, elementFileNameAtom, elementPaddingAtom, elementTransparentAtom , updateSlideElementAtom} from "../../store/editor";


import { BaseFrameProps } from "./index";

const GeminiFrame = ({ padding, darkMode, transparent, fileName, onFileNameChange, flashShown }: BaseFrameProps) => {
  const showBackground = transparent;
  const isSafari = useIsSafari();

  return (
    <div
      className={classNames(
        sharedStyles.frame,
        styles.frame,
        !darkMode && styles.frameLightMode,
        !showBackground && sharedStyles.noBackground,
        !showBackground && styles.noBackground,
        isSafari && styles.isSafari,
      )}
      style={{ padding }}
    >
      {!showBackground && <div data-ignore-in-export className={sharedStyles.transparentPattern}></div>}
      {showBackground && <img src="/stars.svg" alt="stars" className={styles.stars} />}
      <div className={styles.window}>
        {fileName.length > 0 ? (
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
            </div>
          </div>
        ) : flashShown ? null : (
          <div className={styles.header} data-ignore-in-export>
            <div className={classNames(sharedStyles.fileName, styles.fileName)} data-value={fileName}>
              <input
                type="text"
                value={fileName}
                onChange={(event) => onFileNameChange(event.target.value)}
                spellCheck={false}
                tabIndex={-1}
                size={1}
              />
              <span>Untitled-1</span>
            </div>
          </div>
        )}

        <div>
          <Editor />
        </div>
      </div>
    </div>
  );
};

export default GeminiFrame;
