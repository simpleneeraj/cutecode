import classNames from "classnames";
import { useAtom, useAtomValue } from "jotai";
import React from "react";





import Editor from "../Editor";
import sharedStyles from "./DefaultFrame.module.css";
import styles from "./OpenAIFrame.module.css";
import { elementDarkModeAtom, elementPaddingAtom, elementTransparentAtom } from "../../store/editor";


const OpenAIFrame = () => {
  const darkMode = useAtomValue(elementDarkModeAtom);
  const [padding] = useAtom(elementPaddingAtom);
  const [showBackground] = useAtom(elementTransparentAtom);

  return (
    <div
      className={classNames(
        styles.frame,
        !darkMode && styles.frameLightMode,
        !showBackground && sharedStyles.noBackground,
        !showBackground && styles.noBackground,
      )}
      style={{ padding, "--padding": `${padding}px` } as React.CSSProperties}
    >
      {!showBackground && <div data-ignore-in-export className={sharedStyles.transparentPattern}></div>}
      <div className={styles.window}>
        <Editor />
      </div>
    </div>
  );
};

export default OpenAIFrame;
