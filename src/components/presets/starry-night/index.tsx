import { motion } from "framer-motion";
import { Icon } from "@/components/ui/icon";
import styles from "./starry-night.module.css";
import { BaseFrameProps } from "@/typings/presets";

/*
  Starry Night
  Palette: deep navy · cosmic blue · gold · nebula violet
  Vibe: infinite cosmos, deep-space wonder
*/

const STARS = Array.from({ length: 55 }, (_, i) => ({
  id: i,
  left: `${(i * 37 + 13) % 100}%`,
  top: `${(i * 29 + 7) % 100}%`,
  size: 1 + ((i * 3) % 3),
  dur: 2 + ((i * 7) % 5),
  delay: -((i * 11) % 8),
  color: (["#e8f4fd", "#fbbf24", "#a78bfa", "#60a5fa"] as const)[i % 4],
}));

export default function StarryNightFrame({ padding, darkMode, transparent, children }: BaseFrameProps) {
  return (
    <div
      className={[styles.scene, darkMode ? styles.dark : styles.light, transparent ? styles.transparent : ""].join(" ")}
      style={{ padding }}
    >
      {/* ── Nebula blobs ── */}
      <div className={styles.blobA} aria-hidden />
      <div className={styles.blobB} aria-hidden />
      <div className={styles.blobC} aria-hidden />

      {/* ── Twinkling stars ── */}
      <div className={styles.starLayer} aria-hidden>
        {STARS.map((s) => (
          <motion.div
            key={s.id}
            style={{
              position: "absolute",
              left: s.left,
              top: s.top,
              width: s.size,
              height: s.size,
              borderRadius: "50%",
              background: s.color,
              boxShadow: `0 0 ${s.size * 2}px ${s.color}`,
            }}
            animate={{ opacity: [0.1, 1, 0.1], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* ── Shooting star ── */}
      <div className={styles.shootingLayer} aria-hidden>
        <motion.div
          className={styles.shootingStar}
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: [-80, 900], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 8, ease: "easeIn" }}
        />
      </div>

      {/* ── Window ── */}
      <motion.div
        className={styles.window}
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Sweeping top edge */}
        <div className={styles.topEdge} aria-hidden>
          <motion.div
            className={styles.topEdgeSweep}
            animate={{ x: ["-100%", "300%"] }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
          />
        </div>

        <div className={styles.header}>
          <div className={styles.dots}>
            <span className={`${styles.dot} ${styles.dotA}`} />
            <span className={`${styles.dot} ${styles.dotB}`} />
            <span className={`${styles.dot} ${styles.dotC}`} />
          </div>
          <div className={styles.headerCenter}>
            <Icon icon="fluent-emoji:star" width={18} height={18} />
            <span className={styles.headerLabel}>starry-night</span>
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
