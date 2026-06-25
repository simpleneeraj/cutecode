import { motion } from "framer-motion";
import { Icon } from "@/components/ui/icon";
import styles from "./frosted-glass.module.css";
import { BaseFrameProps } from "@/typings/presets";

/*
  Frosted Glass
  Palette: indigo · violet · sky · rose — vivid blobs behind a glass panel
  Vibe: glassmorphism, premium minimal, crystal clarity
*/

const FLECKS = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  left: `${(i * 41 + 11) % 100}%`,
  width: 4 + ((i * 5) % 8),
  height: 2 + ((i * 3) % 4),
  dur: 12 + ((i * 7) % 10),
  delay: -((i * 9) % 18),
  rotate: (i * 30) % 360,
  color: (["rgba(99,102,241,0.6)", "rgba(139,92,246,0.6)", "rgba(56,189,248,0.6)", "rgba(244,63,94,0.5)"] as const)[i % 4],
}));

export default function FrostedGlassFrame({ padding, darkMode, transparent, children }: BaseFrameProps) {
  return (
    <div
      className={[styles.scene, darkMode ? styles.dark : styles.light, transparent ? styles.transparent : ""].join(" ")}
      style={{ padding }}
    >
      {/* ── Vivid blobs that show through the glass ── */}
      <div className={styles.blobA} aria-hidden />
      <div className={styles.blobB} aria-hidden />
      <div className={styles.blobC} aria-hidden />
      <div className={styles.blobD} aria-hidden />

      {/* ── Drifting prismatic flecks ── */}
      <div className={styles.fleckLayer} aria-hidden>
        {FLECKS.map((f) => (
          <motion.div
            key={f.id}
            style={{
              position: "absolute",
              bottom: 0,
              left: f.left,
              width: f.width,
              height: f.height,
              borderRadius: 2,
              background: f.color,
              rotate: f.rotate,
            }}
            animate={{ y: [0, -280], opacity: [0, 0.6, 0.3, 0], rotate: [f.rotate, f.rotate + 180] }}
            transition={{ duration: f.dur, delay: f.delay, repeat: Infinity, ease: "linear" }}
          />
        ))}
      </div>

      {/* ── Window — frosted glass panel ── */}
      <motion.div
        className={styles.window}
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Sweeping prismatic edge */}
        <div className={styles.topEdge} aria-hidden>
          <motion.div
            className={styles.topEdgeSweep}
            animate={{ x: ["-100%", "300%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
          />
        </div>

        <div className={styles.header}>
          <div className={styles.dots}>
            <span className={`${styles.dot} ${styles.dotA}`} />
            <span className={`${styles.dot} ${styles.dotB}`} />
            <span className={`${styles.dot} ${styles.dotC}`} />
          </div>
          <div className={styles.headerCenter}>
            <Icon icon="fluent-emoji:snowflake" width={18} height={18} />
            <span className={styles.headerLabel}>frosted-glass</span>
          </div>
          <div className={styles.headerRight}>
            <Icon icon="fluent-emoji:sparkles" width={16} height={16} />
          </div>
        </div>

        <div className={styles.headerRule} aria-hidden />
        <div className={styles.editor}>{children}</div>
      </motion.div>
    </div>
  );
}
