import styles from "./vercel.module.css";
import { cn as classNames } from "@/utils/cn";
import { BaseFrameProps } from "@/typings/presets";
import sharedStyles from "../default/default.module.css";

const VercelFrame = ({ padding, darkMode, transparent, children }: BaseFrameProps) => {
  return (
    <div
      className={classNames(
        sharedStyles.frame,
        !transparent && styles.frame,
        !transparent && !darkMode && styles.frameLightMode,
        transparent && sharedStyles.noBackground,
        transparent && styles.noBackground,
      )}
      style={{ padding }}
    >
      {transparent && <div data-ignore-in-export className={sharedStyles.transparentPattern}></div>}
      <div className={styles.window}>
        <span className={styles.gridlinesHorizontal} data-grid></span>
        <span className={styles.gridlinesVertical} data-grid></span>
        <span className={styles.bracketLeft} data-grid></span>
        <span className={styles.bracketRight} data-grid></span>
        {children}
      </div>
    </div>
  );
};

export default VercelFrame;
