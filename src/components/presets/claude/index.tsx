import { Icon } from "@/components/ui/icon";
import styles from "./claude.module.css";
import { cn as classNames } from "@/utils/cn";
import { BaseFrameProps } from "@/typings/presets";
import sharedStyles from "../default/default.module.css";

const ClaudeFrame = ({ padding, darkMode, transparent, children, fileName, onFileNameChange }: BaseFrameProps) => {
  // const iconColor = darkMode ? "#8b5a3a" : "#c4855a";
  // const accentColor = darkMode ? "#d97757" : "#c06040";
  // const dimColor = darkMode ? "#5a3a28" : "#b07060";

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
      {transparent && <div data-ignore-in-export className={sharedStyles.transparentPattern} />}
      <div
        className={classNames(styles.window, {
          [styles.darkWindow]: darkMode,
          [styles.lightWindow]: !darkMode,
        })}
      >
        <div className={styles.header}>
          {/* Dot controls */}
          <div className={styles.dots}>
            <span className={classNames(styles.dot, styles.dotA)} />
            <span className={classNames(styles.dot, styles.dotB)} />
            <span className={classNames(styles.dot, styles.dotC)} />
          </div>

          <div className={sharedStyles.fileName}>
            <input
              type="text"
              value={fileName}
              onChange={(e) => onFileNameChange(e.target.value)}
              placeholder="New Snippet"
            />
          </div>

          <div className={styles.headerRight}>
            <Icon icon="logos:claude-icon" className="size-3.5" />
          </div>
        </div>

        <div className={styles.editor}>{children}</div>
      </div>
    </div>
  );
};

export default ClaudeFrame;
