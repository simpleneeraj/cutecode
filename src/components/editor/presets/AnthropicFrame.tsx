import classNames from "classnames";
import { HugeiconsIcon } from "@hugeicons/react";
import { BaseFrameProps } from "@/typings/presets";
import styles from "@/styles/presets/AnthropicFrame.module.css";
import sharedStyles from "@/styles/presets/DefaultFrame.module.css";
import { Brain01Icon, Atom01Icon, Sparkles } from "@hugeicons/core-free-icons";
import { SvgBlurBackdrop } from "./SvgBlurBackdrop";

/* Deterministic ambient element layout */
const AMBIENT = [
  { Icon: Brain01Icon, x: 5, y: 5, size: 20, rotate: -15, opacity: 0.18 },
  { Icon: Sparkles, x: 87, y: 4, size: 14, rotate: 20, opacity: 0.15 },
  { Icon: Atom01Icon, x: 3, y: 75, size: 18, rotate: -40, opacity: 0.14 },
  { Icon: Sparkles, x: 88, y: 78, size: 14, rotate: 50, opacity: 0.16 },
  { Icon: Atom01Icon, x: 45, y: 2, size: 14, rotate: 10, opacity: 0.1 },
  { Icon: Brain01Icon, x: 91, y: 38, size: 16, rotate: 25, opacity: 0.12 },
  { Icon: Sparkles, x: 0, y: 42, size: 13, rotate: -60, opacity: 0.1 },
  { Icon: Atom01Icon, x: 65, y: 90, size: 14, rotate: -20, opacity: 0.13 },
  { Icon: Sparkles, x: 28, y: 92, size: 12, rotate: 35, opacity: 0.11 },
] as const;

const AnthropicFrame = ({ padding, darkMode, transparent, children }: BaseFrameProps) => {
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
          {AMBIENT.map(({ Icon, x, y, size, rotate, opacity }, i) => (
            <span
              key={i}
              className={styles.ambientIcon}
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: `rotate(${rotate}deg)`,
                opacity,
                width: size,
                height: size,
              }}
            >
              <HugeiconsIcon icon={Icon} size={size} color={iconColor} strokeWidth={1.2} />
            </span>
          ))}
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
            <HugeiconsIcon icon={Brain01Icon} size={12} color={accentColor} strokeWidth={1.5} />
            <span className={styles.headerLabel}>Anthropic</span>
          </div>

          {/* Right: atom accent */}
          <div className={styles.headerRight}>
            <HugeiconsIcon icon={Atom01Icon} size={13} color={dimColor} strokeWidth={1.2} />
          </div>
        </div>

        <div className={styles.editor}>{children}</div>
      </div>
    </div>
  );
};

export default AnthropicFrame;
