import classNames from "classnames";

import useIsSafari from "../../util/useIsSafari";
import Editor from "../Editor";
import styles from "./DefaultFrame.module.css";
import { BaseFrameProps } from "./index";

const DefaultFrame = ({ padding, darkMode, transparent, fileName, themeBackground, onFileNameChange, themeId }: BaseFrameProps) => {
  const isSafari = useIsSafari();

  return (
    <div
      className={classNames(
        styles.frame,
        styles[themeId || "default"],
        darkMode && styles.darkMode,
        transparent && styles.withBackground,
      )}
      style={{
        padding,
        backgroundImage: transparent ? themeBackground : "",
      }}
    >
      {!transparent && <div data-ignore-in-export className={styles.transparentPattern}></div>}
      <div
        className={classNames(styles.window, {
          [styles.withBorder]: !isSafari,
          [styles.withShadow]: !isSafari && transparent,
        })}
      >
        <div className={styles.header}>
          <div className={styles.controls}>
            <div className={styles.control}></div>
            <div className={styles.control}></div>
            <div className={styles.control}></div>
          </div>
          <div className={styles.fileName}>
            <input
              type="text"
              value={fileName}
              onChange={(event) => onFileNameChange(event.target.value)}
              spellCheck={false}
              tabIndex={-1}
            />
            {fileName.length === 0 ? <span data-ignore-in-export>Untitled-1</span> : null}
          </div>
        </div>
        <Editor />
      </div>
    </div>
  );
};

export default DefaultFrame;
