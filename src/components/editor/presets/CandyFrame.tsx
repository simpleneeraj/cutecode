import classNames from "classnames";
import { BaseFrameProps } from "@/typings/presets";
import styles from "@/styles/presets/CandyFrame.module.css";
import sharedStyles from "@/styles/presets/DefaultFrame.module.css";
import { SvgBlurBackdrop } from "./SvgBlurBackdrop";

/* Deterministic soda bubbles for SSR safety */
const BUBBLES = [
  { id: 1, left: 10, size: 24, duration: 6, delay: 0 },
  { id: 2, left: 25, size: 16, duration: 4.5, delay: 1.2 },
  { id: 3, left: 85, size: 30, duration: 7, delay: 0.5 },
  { id: 4, left: 45, size: 18, duration: 5, delay: 0.8 },
  { id: 5, left: 65, size: 22, duration: 5.5, delay: 2.1 },
  { id: 6, left: 5, size: 14, duration: 4, delay: 1.5 },
  { id: 7, left: 92, size: 28, duration: 6.5, delay: 2.4 },
  { id: 8, left: 75, size: 20, duration: 5.2, delay: 0.2 },
  { id: 9, left: 35, size: 26, duration: 6.2, delay: 1.8 },
  { id: 10, left: 55, size: 17, duration: 4.8, delay: 2.7 },
  { id: 11, left: 80, size: 15, duration: 4.2, delay: 0.9 },
  { id: 12, left: 15, size: 25, duration: 5.8, delay: 1.1 },
  { id: 13, left: 50, size: 21, duration: 5.4, delay: 0.4 },
  { id: 14, left: 70, size: 19, duration: 5.1, delay: 2.6 },
  { id: 15, left: 20, size: 27, duration: 6.7, delay: 1.9 },
];

const CandyFrame = ({ padding, darkMode, transparent, children }: BaseFrameProps) => {
  return (
    <div
      className={classNames(
        sharedStyles.frame,
        transparent && styles.frame,
        transparent && !darkMode && styles.frameLightMode,
        !transparent && sharedStyles.noBackground,
        !transparent && styles.noBackground,
      )}
      style={{ padding }}
    >
      {!transparent && <div data-ignore-in-export className={sharedStyles.transparentPattern} />}

      {/* Soda Bubbles Layer */}
      {transparent && (
        <div className={styles.sodaBubbles} aria-hidden>
          {BUBBLES.map((b) => (
            <div
              key={b.id}
              className={styles.bubble}
              style={{
                left: `${b.left}%`,
                width: `${b.size}px`,
                height: `${b.size}px`,
                animationDuration: `${b.duration}s`,
                animationDelay: `${b.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Striped overlay mask to give it that "Candy" wrap feel */}
      {transparent && <div className={styles.stripesOverlay} aria-hidden />}

      <div
        className={classNames(styles.window, {
          [styles.darkWindow]: darkMode,
          [styles.lightWindow]: !darkMode,
        })}
      >
        {/* SVG-based blur backdrop — replaces CSS backdrop-filter for html-to-image */}
        <SvgBlurBackdrop
          backgroundImage={
            darkMode
              ? "linear-gradient(135deg, #7b1fa2 0%, #4a148c 50%, #1a237e 100%)"
              : "linear-gradient(135deg, #ff4081 0%, #e040fb 50%, #00bcd4 100%)"
          }
          blurAmount={20}
          tintColor={darkMode ? "rgba(30, 15, 60, 0.85)" : "rgba(255, 245, 255, 0.9)"}
          tintBoxShadow={darkMode ? "inset 0 0 20px rgba(123,31,162,0.5)" : "inset 0 0 20px rgba(255,64,129,0.15)"}
        />
        {/* Jelly reflection overlay on the glass */}
        <div className={styles.jellyGloss} aria-hidden />

        <div className={styles.header}>
          {/* 3D Candies as Window Controls */}
          <div className={styles.dots}>
            <span className={classNames(styles.dot, styles.candyRed)} />
            <span className={classNames(styles.dot, styles.candyYellow)} />
            <span className={classNames(styles.dot, styles.candyGreen)} />
          </div>

          {/* Center Sweet Label */}
          <div className={styles.headerCenter}>
            <span className={styles.headerLabel}>Soda</span>
          </div>

          <div className={styles.headerRight} />
        </div>

        <div className={styles.editor}>{children}</div>
      </div>
    </div>
  );
};

export default CandyFrame;
