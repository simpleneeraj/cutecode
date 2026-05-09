import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import styles from "./style.module.css";
import { BaseFrameProps } from "@/typings/presets";

/* ─────────────────────────────────────────────────────────────
   Sunset Chill Frame
   Palette  → dusk purple × glowing orange × deep pink
   Vibe     → golden hour, lo-fi beats, warm evening breezes
───────────────────────────────────────────────────────────── */

/* ── Ambient icons — sunset aesthetic set ── */
const AMBIENT_ICONS = [
  { icon: "fluent-emoji:sunset", x: 6, y: 12, size: 24, dur: 11, delay: 0 },
  { icon: "fluent-emoji:palm-tree", x: 86, y: 10, size: 22, dur: 13, delay: -2 },
  { icon: "fluent-emoji:sun", x: 78, y: 80, size: 20, dur: 10, delay: -5 },
  { icon: "fluent-emoji:glowing-star", x: 8, y: 70, size: 16, dur: 9, delay: -1 },
  { icon: "fluent-emoji:tropical-drink", x: 45, y: 5, size: 18, dur: 12, delay: -7 },
  { icon: "fluent-emoji:sparkles", x: 90, y: 45, size: 16, dur: 8, delay: -4 },
  { icon: "fluent-emoji:crescent-moon", x: 4, y: 40, size: 20, dur: 14, delay: -3 },
  { icon: "fluent-emoji:star", x: 55, y: 90, size: 14, dur: 9, delay: -6 },
  { icon: "fluent-emoji:glowing-star", x: 22, y: 88, size: 16, dur: 11, delay: -2.5 },
  { icon: "fluent-emoji:butterfly", x: 80, y: 25, size: 18, dur: 10, delay: -8 },
  { icon: "fluent-emoji:sun-with-face", x: 38, y: 92, size: 18, dur: 12, delay: -4.5 },
  { icon: "fluent-emoji:sparkles", x: 15, y: 22, size: 16, dur: 13, delay: -1.5 },
] as const;

/* ── Floating fireflies / embers ── */
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${(i * 37 + 13) % 100}%`,
  size: 3 + ((i * 5) % 4),
  duration: 8 + ((i * 7) % 6),
  delay: -((i * 11) % 12),
  color: (["#FFA62B", "#FF8A5B", "#FFE28A"] as const)[i % 3],
}));

export default function SunsetChillFrame({ padding, darkMode, transparent, children }: BaseFrameProps) {
  return (
    <div
      className={[styles.scene, darkMode ? styles.dark : styles.light, transparent ? styles.transparent : ""].join(" ")}
      style={{ padding }}
    >
      {/* ── Atmospheric blobs ── */}
      <div className={styles.blobPurple} aria-hidden />
      <div className={styles.blobPink} aria-hidden />
      <div className={styles.blobOrange} aria-hidden />

      {/* ── Glowing fireflies ── */}
      <div className={styles.particleLayer} aria-hidden>
        {PARTICLES.map((p) => (
          <div
            key={p.id}
            className={styles.particle}
            style={{
              left: p.left,
              width: p.size,
              height: p.size,
              color: p.color,
              backgroundColor: "currentcolor",
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* ── Floating ambient icons ── */}
      <div className={styles.ambientLayer} aria-hidden>
        {AMBIENT_ICONS.map((a, i) => (
          <motion.span
            key={i}
            className={styles.ambientIcon}
            style={{ left: `${a.x}%`, top: `${a.y}%` }}
            animate={{
              y: [0, -15, 0],
              rotate: [0, i % 2 === 0 ? 10 : -10, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: a.dur,
              repeat: Infinity,
              ease: "easeInOut",
              delay: a.delay,
            }}
          >
            <Icon icon={a.icon} width={a.size} height={a.size} />
          </motion.span>
        ))}
      </div>

      {/* ── Main window ── */}
      <motion.div
        className={styles.window}
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* ── Header ── */}
        <div className={styles.header}>
          {/* Traffic-light dots */}
          <div className={styles.dots}>
            <span className={`${styles.dot} ${styles.dotA}`} />
            <span className={`${styles.dot} ${styles.dotB}`} />
            <span className={`${styles.dot} ${styles.dotC}`} />
          </div>

          {/* Center wordmark */}
          <div className={styles.headerCenter}>
            <Icon icon="fluent-emoji:sunset" width={18} height={18} />
            <span className={styles.headerLabel}>sunset-chill</span>
          </div>

          {/* Right accent */}
          <div className={styles.headerRight}>
            <Icon icon="fluent-emoji:sparkles" width={16} height={16} />
          </div>
        </div>

        {/* Divider rule */}
        <div className={styles.headerRule} aria-hidden />

        {/* ── Code editor ── */}
        <div className={styles.editor}>{children}</div>
      </motion.div>
    </div>
  );
}
