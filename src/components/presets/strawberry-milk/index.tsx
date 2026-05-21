import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import styles from "./strawberry-milk.module.css";
import { BaseFrameProps } from "@/typings/presets";

/*
  Strawberry Milk
  Palette: strawberry red · blush pink · cream
  Vibe: kawaii milk bar, soft girl era
*/

const AMBIENT_ICONS = [
  { icon: "fluent-emoji:strawberry", x: 5,  y: 5,  size: 22, dur: 9  },
  { icon: "fluent-emoji:cherry",     x: 88, y: 6,  size: 18, dur: 11 },
  { icon: "fluent-emoji:heart-suit", x: 80, y: 82, size: 16, dur: 8  },
  { icon: "fluent-emoji:strawberry", x: 3,  y: 74, size: 20, dur: 10 },
  { icon: "fluent-emoji:cherry",     x: 46, y: 2,  size: 18, dur: 12 },
  { icon: "fluent-emoji:heart-suit", x: 92, y: 44, size: 14, dur: 9  },
  { icon: "fluent-emoji:sparkles",   x: 2,  y: 40, size: 16, dur: 13 },
  { icon: "fluent-emoji:strawberry", x: 60, y: 92, size: 18, dur: 8  },
  { icon: "fluent-emoji:cherry",     x: 20, y: 88, size: 15, dur: 14 },
] as const;

const PARTICLES = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  left: `${(i * 43 + 9) % 100}%`,
  size: 3 + ((i * 5) % 3),
  dur: 10 + ((i * 9) % 8),
  delay: -((i * 7) % 14),
  color: (["#ffb3c1", "#ff8fa3", "#ffd6e0", "#ffccd5"] as const)[i % 4],
}));

export default function StrawberryMilkFrame({ padding, darkMode, transparent, children }: BaseFrameProps) {
  return (
    <div
      className={[styles.scene, darkMode ? styles.dark : styles.light, transparent ? styles.transparent : ""].join(" ")}
      style={{ padding }}
    >
      {/* ── Blobs ── */}
      <div className={styles.blobPink}  aria-hidden />
      <div className={styles.blobRed}   aria-hidden />
      <div className={styles.blobCream} aria-hidden />

      {/* ── Rising milk-bubble particles ── */}
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
            }}
            animate={{ y: [0, -320], opacity: [0, 0.8, 0.3, 0] }}
            transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "linear" }}
          />
        ))}
      </div>

      {/* ── Floating kawaii icons ── */}
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
        {/* Sweeping top edge */}
        <div className={styles.topEdge} aria-hidden>
          <motion.div
            className={styles.topEdgeSweep}
            animate={{ x: ["-100%", "300%"] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "linear", repeatDelay: 1.5 }}
          />
        </div>

        <div className={styles.header}>
          <div className={styles.dots}>
            <span className={`${styles.dot} ${styles.dotA}`} />
            <span className={`${styles.dot} ${styles.dotB}`} />
            <span className={`${styles.dot} ${styles.dotC}`} />
          </div>
          <div className={styles.headerCenter}>
            <Icon icon="fluent-emoji:strawberry" width={18} height={18} />
            <span className={styles.headerLabel}>strawberry-milk</span>
          </div>
          <div className={styles.headerRight}>
            <Icon icon="fluent-emoji:heart-suit" width={16} height={16} />
          </div>
        </div>

        <div className={styles.headerRule} aria-hidden />
        <div className={styles.editor}>{children}</div>
      </motion.div>
    </div>
  );
}
