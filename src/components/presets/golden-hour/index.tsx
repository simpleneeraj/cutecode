import { motion } from "framer-motion";
import { Icon } from "@/components/ui/icon";
import styles from "./golden-hour.module.css";
import { BaseFrameProps } from "@/typings/presets";

/*
  Golden Hour
  Palette: amber · gold · warm cream · honey
  Vibe: late afternoon sun, cozy warmth, golden magic
*/

const AMBIENT_ICONS = [
  { icon: "fluent-emoji:sun-with-face", x: 6,  y: 5,  size: 22, dur: 10 },
  { icon: "fluent-emoji:sparkles",      x: 87, y: 7,  size: 18, dur: 12 },
  { icon: "fluent-emoji:maple-leaf",    x: 80, y: 82, size: 18, dur: 9  },
  { icon: "fluent-emoji:sun-with-face", x: 4,  y: 74, size: 20, dur: 11 },
  { icon: "fluent-emoji:sparkles",      x: 46, y: 2,  size: 16, dur: 13 },
  { icon: "fluent-emoji:maple-leaf",    x: 92, y: 45, size: 16, dur: 8  },
  { icon: "fluent-emoji:star",          x: 2,  y: 38, size: 14, dur: 14 },
  { icon: "fluent-emoji:sparkles",      x: 60, y: 91, size: 16, dur: 9  },
  { icon: "fluent-emoji:maple-leaf",    x: 22, y: 88, size: 15, dur: 11 },
] as const;

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${(i * 41 + 9) % 100}%`,
  size: 3 + ((i * 4) % 3),
  dur: 11 + ((i * 9) % 9),
  delay: -((i * 7) % 16),
  color: (["#fcd34d", "#f59e0b", "#fde68a", "#fbbf24"] as const)[i % 4],
}));

export default function GoldenHourFrame({ padding, darkMode, transparent, children }: BaseFrameProps) {
  return (
    <div
      className={[styles.scene, darkMode ? styles.dark : styles.light, transparent ? styles.transparent : ""].join(" ")}
      style={{ padding }}
    >
      {/* ── Golden blobs ── */}
      <div className={styles.blobA} aria-hidden />
      <div className={styles.blobB} aria-hidden />
      <div className={styles.blobC} aria-hidden />

      {/* ── Rising golden particles ── */}
      <div className={styles.particleLayer} aria-hidden>
        {PARTICLES.map((p) => (
          <motion.div
            key={p.id}
            style={{
              position: "absolute",
              bottom: 0,
              left: p.left,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: p.color,
              boxShadow: `0 0 4px ${p.color}`,
            }}
            animate={{ y: [0, -330], opacity: [0, 0.75, 0.35, 0] }}
            transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "linear" }}
          />
        ))}
      </div>

      {/* ── Floating icons ── */}
      <div className={styles.ambientLayer} aria-hidden>
        {AMBIENT_ICONS.map((a, i) => (
          <motion.span
            key={i}
            className={styles.ambientIcon}
            style={{ left: `${a.x}%`, top: `${a.y}%` }}
            animate={{ y: [0, -10, 0], rotate: [0, i % 2 === 0 ? 8 : -8, 0] }}
            transition={{ duration: a.dur, repeat: Infinity, ease: "easeInOut" }}
          >
            <Icon icon={a.icon} width={a.size} height={a.size} />
          </motion.span>
        ))}
      </div>

      {/* ── Window ── */}
      <motion.div
        className={styles.window}
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
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
            <Icon icon="fluent-emoji:sun-with-face" width={18} height={18} />
            <span className={styles.headerLabel}>golden-hour</span>
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
