import { motion } from "framer-motion";
import { Icon } from "@/components/ui/icon";
import styles from "./velvet-night.module.css";
import { BaseFrameProps } from "@/typings/presets";

/*
  Velvet Night
  Palette: deep indigo · royal violet · soft lavender
  Vibe: luxury dark, velvet curtain, midnight opulence
*/

const AMBIENT_ICONS = [
  { icon: "fluent-emoji:purple-heart",  x: 6,  y: 5,  size: 20, dur: 10 },
  { icon: "fluent-emoji:crescent-moon", x: 87, y: 7,  size: 18, dur: 12 },
  { icon: "fluent-emoji:sparkles",      x: 79, y: 81, size: 16, dur: 9  },
  { icon: "fluent-emoji:purple-heart",  x: 4,  y: 73, size: 18, dur: 11 },
  { icon: "fluent-emoji:crescent-moon", x: 45, y: 3,  size: 14, dur: 13 },
  { icon: "fluent-emoji:sparkles",      x: 91, y: 45, size: 14, dur: 8  },
  { icon: "fluent-emoji:star",          x: 2,  y: 38, size: 16, dur: 14 },
  { icon: "fluent-emoji:purple-heart",  x: 60, y: 91, size: 14, dur: 9  },
] as const;

const PARTICLES = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  left: `${(i * 43 + 11) % 100}%`,
  size: 2 + ((i * 4) % 3),
  dur: 12 + ((i * 7) % 10),
  delay: -((i * 9) % 18),
  color: (["#a78bfa", "#7c3aed", "#c4b5fd", "#ddd6fe"] as const)[i % 4],
}));

export default function VelvetNightFrame({ padding, darkMode, transparent, children }: BaseFrameProps) {
  return (
    <div
      className={[styles.scene, darkMode ? styles.dark : styles.light, transparent ? styles.transparent : ""].join(" ")}
      style={{ padding }}
    >
      {/* ── Velvet orbs ── */}
      <div className={styles.blobA} aria-hidden />
      <div className={styles.blobB} aria-hidden />
      <div className={styles.blobC} aria-hidden />

      {/* ── Rising violet particles ── */}
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
              boxShadow: `0 0 6px ${p.color}`,
            }}
            animate={{ y: [0, -340], opacity: [0, 0.8, 0.4, 0] }}
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
            animate={{ y: [0, -10, 0], rotate: [0, i % 2 === 0 ? 6 : -6, 0] }}
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
            <Icon icon="fluent-emoji:purple-heart" width={18} height={18} />
            <span className={styles.headerLabel}>velvet-night</span>
          </div>
          <div className={styles.headerRight}>
            <Icon icon="fluent-emoji:crescent-moon" width={16} height={16} />
          </div>
        </div>

        <div className={styles.headerRule} aria-hidden />
        <div className={styles.editor}>{children}</div>
      </motion.div>
    </div>
  );
}
