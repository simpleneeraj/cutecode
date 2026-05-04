import { cn } from "@/utils/cn";
import { BaseFrameProps } from "@/typings/presets";
import styles from "@/styles/presets/DefaultFrame.module.css";
import useIsSafari from "@/components/editor/util/useIsSafari";

const DefaultFrame = ({
  padding,
  darkMode,
  transparent,
  fileName,
  themeBackground,
  backgroundImage,
  onFileNameChange,
  themeId,
  children,
}: BaseFrameProps) => {
  const isSafari = useIsSafari();

  return (
    <div
      className={cn(
        styles.frame,
        styles[themeId || "default"],
        darkMode && styles.darkMode,
        transparent && styles.withBackground,
      )}
      style={{
        padding,
        backgroundImage: transparent ? (backgroundImage ? `url("${backgroundImage}")` : themeBackground) : "",
        backgroundSize: backgroundImage ? "cover" : undefined,
        backgroundPosition: backgroundImage ? "center" : undefined,
      }}
    >
      {!transparent && <div data-ignore-in-export className={styles.transparentPattern}></div>}
      <div
        className={cn(styles.window, {
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
        {children}
      </div>
    </div>
  );
};

export default DefaultFrame;
