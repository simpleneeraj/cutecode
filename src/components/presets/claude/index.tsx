import classNames from "classnames";
import { motion } from "framer-motion";
import { BaseFrameProps } from "@/typings/presets";
import styles from "./claude.module.css";
import sharedStyles from "../default/default.module.css";
import { SvgBlurBackdrop } from "../BlurBackdrop";
import { Icon } from "@iconify/react";

/* Deterministic ambient element layout */
const AMBIENT = [
  "hugeicons:ai-brain-02",
  "hugeicons:sparkles",
  "hugeicons:atom-02",
  "hugeicons:sparkles",
  "hugeicons:atom-02",
  "hugeicons:ai-brain-02",
  "hugeicons:sparkles",
  "hugeicons:atom-02",
  "hugeicons:sparkles",
] as const;

const ClaudeFrame = ({ padding, darkMode, transparent, children }: BaseFrameProps) => {
  const iconColor = darkMode ? "#8b5a3a" : "#c4855a";
  const accentColor = darkMode ? "#d97757" : "#c06040";
  const dimColor = darkMode ? "#5a3a28" : "#b07060";

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

      {/* Ambient icons — only with background */}
      {transparent && (
        <div className={styles.ambientLayer} aria-hidden>
          {AMBIENT.map((icon, i) => {
            // Pseudo-random but deterministic values based on index to prevent SSR mismatch
            const x = 5 + ((i * 37) % 90);
            const y = 5 + ((i * 23) % 90);
            const rotate = ((i * 73) % 360) - 180;
            const size = 12 + ((i * 7) % 8);
            const opacity = 0.1 + ((i * 3) % 10) / 100;

            return (
              <motion.span
                key={i}
                className={styles.ambientIcon}
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  width: size,
                  height: size,
                  // opacity,
                }}
                animate={{
                  y: [0, -15, 0],
                  x: [0, i % 2 === 0 ? 10 : -10, 0],
                  rotate: [rotate, rotate + 20, rotate],
                }}
                transition={{
                  duration: 8 + (i % 5) * 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Icon icon={icon} width={size} height={size} color={iconColor} strokeWidth={1.2} />
              </motion.span>
            );
          })}
        </div>
      )}

      <div
        className={classNames(styles.window, {
          [styles.darkWindow]: darkMode,
          [styles.lightWindow]: !darkMode,
        })}
      >
        {/* SVG-based blur backdrop — replaces CSS backdrop-filter for html-to-image.
             Dark mode has a solid opaque background so no blur needed. */}
        {!darkMode && (
          <SvgBlurBackdrop
            backgroundImage="radial-gradient(ellipse at 25% 15%, #f5ede4 0%, #edddd0 55%, #e4d0be 100%)"
            blurAmount={18}
            tintColor="rgba(252, 248, 244, 0.94)"
            tintBoxShadow="inset 0 1px 0 rgba(255,240,230,0.7)"
          />
        )}
        <div className={styles.header}>
          {/* Dot controls */}
          <div className={styles.dots}>
            <span className={classNames(styles.dot, styles.dotA)} />
            <span className={classNames(styles.dot, styles.dotB)} />
            <span className={classNames(styles.dot, styles.dotC)} />
          </div>

          {/* Center wordmark */}
          <div className={styles.headerCenter}>
            <Icon icon="logos:claude-icon" width="20" height="20" />
            <span className={styles.headerLabel}>Claude AI</span>
          </div>

          {/* Right: atom accent */}
          <div className={styles.headerRight}>
            <Icon icon="streamline-pixel:photography-focus-flower" width="20" height="20" />
          </div>
        </div>

        <div className={styles.editor}>{children}</div>
      </div>
    </div>
  );
};

export default ClaudeFrame;
