import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import styles from "./neon-dreams.module.css";
import { BaseFrameProps } from "@/typings/presets";

/*
  Neon Dreams
  Palette: neon pink · neon cyan · electric violet · void black
  Vibe: cyberpunk, synthwave, midnight arcade
*/

const AMBIENT_ICONS = [
  { icon: "fluent-emoji:dizzy",        x: 6,  y: 5,  size: 20, dur: 8  },
  { icon: "fluent-emoji:high-voltage",  x: 88, y: 7,  size: 18, dur: 10 },
  { icon: "fluent-emoji:sparkles",      x: 80, y: 82, size: 16, dur: 9  },
  { icon: "fluent-emoji:dizzy",         x: 4,  y: 74, size: 18, dur: 11 },
  { icon: "fluent-emoji:high-voltage",  x: 46, y: 2,  size: 16, dur: 12 },
  { icon: "fluent-emoji:star",          x: 92, y: 45, size: 14, dur: 8  },
  { icon: "fluent-emoji:sparkles",      x: 2,  y: 38, size: 16, dur: 13 },
  { icon: "fluent-emoji:dizzy",         x: 60, y: 91, size: 14, dur: 9  },
] as const;

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: `${(i * 41 + 7) % 100}%`,
  size: 2 + ((i * 3) % 3),
  dur: 8 + ((i * 7) % 8),
  delay: -((i * 5) % 14),
  color: (["#ff0090", "#00fff9", "#bf00ff", "#00bfff"] as const)[i % 4],
}));

export default function NeonDreamsFrame({ padding, darkMode, transparent, children }: BaseFrameProps) {
  return (
    <div
      className={[styles.scene, darkMode ? styles.dark : styles.light, transparent ? styles.transparent : ""].join(" ")}
      style={{ padding }}
    >
      {/* ── Neon blobs ── */}
      <div className={styles.blobA} aria-hidden />
      <div className={styles.blobB} aria-hidden />
      <div className={styles.blobC} aria-hidden />
      <div className={styles.blobD} aria-hidden />

      {/* ── Rising neon particles ── */}
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
              boxShadow: `0 0 8px ${p.color}, 0 0 16px ${p.color}`,
            }}
            animate={{ y: [0, -360], opacity: [0, 1, 0.5, 0] }}
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
            animate={{ y: [0, -12, 0], rotate: [0, i % 2 === 0 ? 10 : -10, 0] }}
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
            transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
          />
        </div>

        <div className={styles.header}>
          <div className={styles.dots}>
            <span className={`${styles.dot} ${styles.dotA}`} />
            <span className={`${styles.dot} ${styles.dotB}`} />
            <span className={`${styles.dot} ${styles.dotC}`} />
          </div>
          <div className={styles.headerCenter}>
            <Icon icon="fluent-emoji:dizzy" width={18} height={18} />
            <span className={styles.headerLabel}>neon-dreams</span>
          </div>
          <div className={styles.headerRight}>
            <Icon icon="fluent-emoji:high-voltage" width={16} height={16} />
          </div>
        </div>

        <div className={styles.headerRule} aria-hidden />
        <div className={styles.editor}>{children}</div>
      </motion.div>
    </div>
  );
}
