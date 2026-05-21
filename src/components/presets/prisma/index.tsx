import { cn as classNames } from "@/utils/cn";
import { BaseFrameProps } from "@/typings/presets";
import styles from "./prisma.module.css";
import sharedStyles from "../default/default.module.css";

const PrismaFrame = ({
  padding,
  darkMode,
  transparent,
  fileName,
  onFileNameChange,
  children,
}: BaseFrameProps) => {
  const showBackground = !transparent;

  return (
    <div
      className={classNames(
        sharedStyles.frame,
        styles.frame,
        !darkMode && styles.frameLightMode,
        !showBackground && sharedStyles.noBackground,
        !showBackground && styles.noBackground,
      )}
      style={{ padding }}
    >
      {!showBackground && <div data-ignore-in-export className={sharedStyles.transparentPattern}></div>}
      <div className={styles.window}>
        <span data-frameborder />
        <span data-frameborder />
        <span data-frameborder />
        <span data-frameborder />
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
        ) : (
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
        {children}
      </div>
    </div>
  );
};

export default PrismaFrame;
