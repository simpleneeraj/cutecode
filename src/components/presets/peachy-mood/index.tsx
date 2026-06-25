import { motion } from "framer-motion";
import { Icon } from "@/components/ui/icon";
import styles from "./peachy-mood.module.css";
import { BaseFrameProps } from "@/typings/presets";

/*
  Peachy Mood
  Palette: peach · apricot · cream · coral
  Vibe: warm kawaii, soft summer, fruit stall aesthetic
*/

const AMBIENT_ICONS = [
  { icon: "fluent-emoji:peach",          x: 5,  y: 5,  size: 22, dur: 9  },
  { icon: "fluent-emoji:cherry-blossom", x: 87, y: 6,  size: 18, dur: 11 },
  { icon: "fluent-emoji:sparkles",       x: 80, y: 82, size: 16, dur: 8  },
  { icon: "fluent-emoji:peach",          x: 3,  y: 74, size: 20, dur: 10 },
  { icon: "fluent-emoji:cherry-blossom", x: 46, y: 2,  size: 18, dur: 12 },
  { icon: "fluent-emoji:sun-with-face",  x: 92, y: 44, size: 16, dur: 9  },
  { icon: "fluent-emoji:sparkles",       x: 2,  y: 40, size: 14, dur: 13 },
  { icon: "fluent-emoji:peach",          x: 60, y: 92, size: 18, dur: 8  },
  { icon: "fluent-emoji:cherry-blossom", x: 20, y: 88, size: 15, dur: 14 },
] as const;

const PARTICLES = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  left: `${(i * 43 + 9) % 100}%`,
  size: 3 + ((i * 5) % 3),
  dur: 10 + ((i * 9) % 8),
  delay: -((i * 7) % 14),
  color: (["#fdba74", "#fb923c", "#fed7aa", "#ffedd5"] as const)[i % 4],
}));

export default function PeachyMoodFrame({ padding, darkMode, transparent, children }: BaseFrameProps) {
  return (
    <div
      className={[styles.scene, darkMode ? styles.dark : styles.light, transparent ? styles.transparent : ""].join(" ")}
      style={{ padding }}
    >
      {/* ── Peach blobs ── */}
      <div className={styles.blobA} aria-hidden />
      <div className={styles.blobB} aria-hidden />
      <div className={styles.blobC} aria-hidden />

      {/* ── Rising peach particles ── */}
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
            animate={{ y: [0, -320], opacity: [0, 0.7, 0.3, 0] }}
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
            animate={{ y: [0, -10, 0], rotate: [0, i % 2 === 0 ? 7 : -7, 0] }}
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
            <Icon icon="fluent-emoji:peach" width={18} height={18} />
            <span className={styles.headerLabel}>peachy-mood</span>
          </div>
          <div className={styles.headerRight}>
            <Icon icon="fluent-emoji:cherry-blossom" width={16} height={16} />
          </div>
        </div>

        <div className={styles.headerRule} aria-hidden />
        <div className={styles.editor}>{children}</div>
      </motion.div>
    </div>
  );
}
