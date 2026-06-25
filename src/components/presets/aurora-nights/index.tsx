import { motion } from "framer-motion";
import { Icon } from "@/components/ui/icon";
import styles from "./aurora-nights.module.css";
import { BaseFrameProps } from "@/typings/presets";

/*
  Aurora Nights
  Palette: deep teal-black · aurora green · teal · violet
  Vibe: northern lights, arctic midnight
*/

const AMBIENT_ICONS = [
  { icon: "fluent-emoji:sparkles",  x: 6,  y: 5,  size: 20, dur: 8  },
  { icon: "fluent-emoji:star",      x: 88, y: 8,  size: 16, dur: 11 },
  { icon: "fluent-emoji:snowflake", x: 78, y: 80, size: 18, dur: 9  },
  { icon: "fluent-emoji:star",      x: 4,  y: 72, size: 14, dur: 13 },
  { icon: "fluent-emoji:sparkles",  x: 44, y: 3,  size: 16, dur: 10 },
  { icon: "fluent-emoji:snowflake", x: 92, y: 46, size: 14, dur: 9  },
  { icon: "fluent-emoji:star",      x: 2,  y: 36, size: 16, dur: 12 },
  { icon: "fluent-emoji:sparkles",  x: 58, y: 92, size: 14, dur: 8  },
] as const;

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${(i * 41 + 7) % 100}%`,
  size: 2 + ((i * 5) % 3),
  dur: 10 + ((i * 9) % 10),
  delay: -((i * 7) % 16),
  color: (["#00ff88", "#00d4d4", "#7c3aed", "#38bdf8"] as const)[i % 4],
}));

export default function AuroraNightsFrame({ padding, darkMode, transparent, children }: BaseFrameProps) {
  return (
    <div
      className={[styles.scene, darkMode ? styles.dark : styles.light, transparent ? styles.transparent : ""].join(" ")}
      style={{ padding }}
    >
      {/* ── Aurora streaks ── */}
      {[
        { cls: styles.aurora1, dur: 14, x: [-50, 40]  },
        { cls: styles.aurora2, dur: 18, x: [30, -40]  },
        { cls: styles.aurora3, dur: 22, x: [-20, 45]  },
      ].map((a, i) => (
        <motion.div
          key={i}
          className={a.cls}
          animate={{ x: a.x, scaleY: [1, 1.15, 1] }}
          transition={{ duration: a.dur, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        />
      ))}

      {/* ── Rising glow particles ── */}
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
            animate={{ y: [0, -350], opacity: [0, 0.9, 0.4, 0] }}
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
            animate={{ y: [0, -12, 0], rotate: [0, i % 2 === 0 ? 8 : -8, 0] }}
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
            transition={{ duration: 4, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
          />
        </div>

        <div className={styles.header}>
          <div className={styles.dots}>
            <span className={`${styles.dot} ${styles.dotA}`} />
            <span className={`${styles.dot} ${styles.dotB}`} />
            <span className={`${styles.dot} ${styles.dotC}`} />
          </div>
          <div className={styles.headerCenter}>
            <Icon icon="fluent-emoji:sparkles" width={18} height={18} />
            <span className={styles.headerLabel}>aurora-nights</span>
          </div>
          <div className={styles.headerRight}>
            <Icon icon="fluent-emoji:snowflake" width={16} height={16} />
          </div>
        </div>

        <div className={styles.headerRule} aria-hidden />
        <div className={styles.editor}>{children}</div>
      </motion.div>
    </div>
  );
}
