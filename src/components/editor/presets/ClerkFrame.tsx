import classNames from "classnames";
import { BaseFrameProps } from "@/typings/presets";
import styles from "@/styles/presets/ClerkFrame.module.css";
import sharedStyles from "@/styles/presets/DefaultFrame.module.css";

const CLERK_PATTERN_URL = "/editor/assets/clerk/pattern.svg";

const ClerkFrame = ({ padding, darkMode, transparent, children }: BaseFrameProps) => {
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
      {transparent && <img src={CLERK_PATTERN_URL} alt="" className={styles.pattern} />}
      <div className={styles.window}>
        <div className={styles.code}>{children}</div>
      </div>
    </div>
  );
};

export default ClerkFrame;
