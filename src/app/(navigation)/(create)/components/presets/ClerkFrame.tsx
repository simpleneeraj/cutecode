import classNames from "classnames";
import { useAtom, useAtomValue } from "jotai";




import clerkPattern from "../../assets/clerk/pattern.svg?url";

import Editor from "../Editor";
import sharedStyles from "./DefaultFrame.module.css";
import styles from "./ClerkFrame.module.css";
import { BaseFrameProps } from "./index";

const ClerkFrame = ({ padding, darkMode, transparent }: BaseFrameProps) => {
  return (
    <div
      className={classNames(
        sharedStyles.frame,
        transparent && styles.frame,
        !darkMode && styles.frameLightMode,
        !transparent && sharedStyles.noBackground,
        !transparent && styles.noBackground,
      )}
      style={{ padding }}
    >
      {!transparent && <div data-ignore-in-export className={sharedStyles.transparentPattern}></div>}
      {transparent && <img src={clerkPattern} alt="" className={styles.pattern} />}
      <div className={styles.window}>
        <div className={styles.code}>
          <Editor />
        </div>
      </div>
    </div>
  );
};

export default ClerkFrame;
