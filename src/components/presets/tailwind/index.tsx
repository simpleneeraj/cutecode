import { cn as classNames } from "@/utils/cn";
import { BaseFrameProps } from "@/typings/presets";
import styles from "./tailwind.module.css";
import sharedStyles from "../default/default.module.css";
import useIsSafari from "@/components/editor/util/useIsSafari";

const BEAMS_URL = "/editor/assets/tailwind/beams.png";

const TailwindFrame = ({ padding, darkMode, transparent, children }: BaseFrameProps) => {
  const showBackground = !transparent;
  const isSafari = useIsSafari();

  return (
    <div
      className={classNames(
        sharedStyles.frame,
        showBackground && styles.frame,
        !darkMode && styles.frameLightMode,
        !showBackground && sharedStyles.noBackground,
        !showBackground && styles.noBackground,
        isSafari && styles.isSafari,
      )}
      style={{ padding }}
    >
      {!showBackground && <div data-ignore-in-export className={sharedStyles.transparentPattern}></div>}
      {showBackground && <img src={BEAMS_URL} alt="beams" className={styles.beams} />}
      <div className={styles.beams} />
      <div className={styles.window}>
        {showBackground && (
          <>
            <span className={styles.gridlinesHorizontal} data-grid></span>
            <span className={styles.gridlinesVertical} data-grid></span>
            <div className={styles.gradient}>
              <div>
                <div className={styles.gradient1}></div>
                <div className={styles.gradient2}></div>
              </div>
            </div>
          </>
        )}
        <div className={classNames(sharedStyles.header, styles.header)}>
          <div className={sharedStyles.controls}>
            <div className={classNames(sharedStyles.control, styles.control)}></div>
            <div className={classNames(sharedStyles.control, styles.control)}></div>
            <div className={classNames(sharedStyles.control, styles.control)}></div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};

export default TailwindFrame;
