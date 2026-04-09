import classNames from "classnames";
import { useAtomValue } from "jotai";
import { HugeiconsIcon } from "@hugeicons/react";
import { Flower, Heart, Leaf01Icon, Sparkles } from "@hugeicons/core-free-icons";

import Editor from "../Editor";
import sharedStyles from "./DefaultFrame.module.css";
import styles from "./RosesFrame.module.css";
import { elementDarkModeAtom, elementPaddingAtom, elementTransparentAtom } from "../../store/editor";

/* ── Deterministic scattered icon layout — SSR-safe (no Math.random) ── */
const SCATTERED_ICONS = [
  { Icon: Flower,    x: 4,  y: 6,  size: 22, rotate: -20, opacity: 0.22 },
  { Icon: Leaf01Icon,x: 88, y: 3,  size: 18, rotate: 40,  opacity: 0.18 },
  { Icon: Flower,    x: 12, y: 80, size: 20, rotate: -55, opacity: 0.16 },
  { Icon: Leaf01Icon,x: 84, y: 78, size: 16, rotate: 65,  opacity: 0.20 },
  { Icon: Sparkles,  x: 46, y: 2,  size: 14, rotate: 10,  opacity: 0.14 },
  { Icon: Flower,    x: 0,  y: 44, size: 18, rotate: -80, opacity: 0.13 },
  { Icon: Sparkles,  x: 91, y: 38, size: 16, rotate: 30,  opacity: 0.15 },
  { Icon: Leaf01Icon,x: 68, y: 89, size: 14, rotate: -15, opacity: 0.17 },
  { Icon: Flower,    x: 28, y: 90, size: 22, rotate: 70,  opacity: 0.14 },
  { Icon: Sparkles,  x: 56, y: 88, size: 12, rotate: -45, opacity: 0.12 },
  { Icon: Leaf01Icon,x: 76, y: 55, size: 14, rotate: 120, opacity: 0.10 },
  { Icon: Sparkles,  x: 20, y: 30, size: 12, rotate: -10, opacity: 0.09 },
] as const;

import { BaseFrameProps } from "./index";

const RosesFrame = ({ padding, darkMode, transparent }: BaseFrameProps) => {

  const iconColor = darkMode ? "#7a1a30" : "#d4708a";
  const accentColor = darkMode ? "#c0304a" : "#b3374e";
  const dimColor = darkMode ? "#6e2030" : "#c07080";

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

      {/* Scattered botanical icons — only with background */}
      {transparent && (
        <div className={styles.iconsLayer} aria-hidden>
          {SCATTERED_ICONS.map(({ Icon, x, y, size, rotate, opacity }, i) => (
            <span
              key={i}
              className={styles.scatteredIcon}
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: `rotate(${rotate}deg)`,
                opacity,
                width: size,
                height: size,
              }}
            >
              <HugeiconsIcon icon={Icon} size={size} color={iconColor} strokeWidth={1.5} />
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
        {/* Header bar */}
        <div className={styles.header}>
          {/* Window control dots with tiny heart icons */}
          <div className={styles.dots}>
            <span className={classNames(styles.dot, styles.dotRed)}>
              <HugeiconsIcon icon={Heart} size={7} color="#fff" strokeWidth={0} />
            </span>
            <span className={classNames(styles.dot, styles.dotPink)}>
              <HugeiconsIcon icon={Heart} size={7} color="#fff" strokeWidth={0} />
            </span>
            <span className={classNames(styles.dot, styles.dotRose)}>
              <HugeiconsIcon icon={Heart} size={7} color="#fff" strokeWidth={0} />
            </span>
          </div>

          {/* Center: mirrored flowers flanking label */}
          <div className={styles.headerCenter}>
            <HugeiconsIcon
              icon={Flower}
              size={13}
              color={accentColor}
              strokeWidth={1.5}
              className={styles.headerFlower}
            />
            <span className={styles.headerLabel}>Roses</span>
            <span style={{ transform: "scaleX(-1)", display: "flex" }}>
              <HugeiconsIcon
                icon={Flower}
                size={13}
                color={accentColor}
                strokeWidth={1.5}
                className={styles.headerFlower}
              />
            </span>
          </div>

          {/* Right: sparkle accent */}
          <div className={styles.headerRight}>
            <HugeiconsIcon icon={Sparkles} size={13} color={dimColor} strokeWidth={1.5} />
          </div>
        </div>

        <div className={styles.editor}>
          <Editor />
        </div>
      </div>
    </div>
  );
};

export default RosesFrame;
