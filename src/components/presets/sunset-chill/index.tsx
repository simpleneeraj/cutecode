import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import styles from "./style.module.css";
import { BaseFrameProps } from "@/typings/presets";

/* ─────────────────────────────────────────────────────────────
   Sunset Chill Frame
   Palette  → dusk purple × glowing orange × deep pink
   Vibe     → golden hour, lo-fi beats, warm evening breezes
───────────────────────────────────────────────────────────── */

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
      className={[styles.scene, darkMode ? styles.dark : styles.light, transparent ? styles.transparent : ""].join(
        " ",
      )}
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
