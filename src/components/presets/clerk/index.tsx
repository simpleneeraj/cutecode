import { cn as classNames } from "@/utils/cn";
import { BaseFrameProps } from "@/typings/presets";
import styles from "./clerk.module.css";
import sharedStyles from "../default/default.module.css";

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
