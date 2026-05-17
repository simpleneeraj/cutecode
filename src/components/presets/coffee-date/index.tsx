import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import styles from "./style.module.css";
import { BaseFrameProps } from "@/typings/presets";

/* ─────────────────────────────────────────────────────────────
   Coffee Date Frame
   Palette  → espresso × mocha × caramel × cream
   Vibe     → cozy cafe, warm latte, morning coding session
───────────────────────────────────────────────────────────── */

/* ── Ambient icons — coffee shop set ── */
const AMBIENT_ICONS = [
  { icon: "fluent-emoji:hot-beverage", x: 8, y: 10, size: 22, dur: 10, delay: 0 },
  { icon: "fluent-emoji:croissant", x: 85, y: 8, size: 20, dur: 12, delay: -2 },
  { icon: "fluent-emoji:cookie", x: 75, y: 82, size: 18, dur: 9, delay: -4 },
  { icon: "fluent-emoji:sparkles", x: 5, y: 75, size: 16, dur: 8, delay: -1 },
  { icon: "fluent-emoji:doughnut", x: 45, y: 4, size: 20, dur: 11, delay: -6 },
  { icon: "fluent-emoji:pancakes", x: 88, y: 45, size: 22, dur: 13, delay: -3 },
  { icon: "fluent-emoji:pie", x: 4, y: 40, size: 18, dur: 10, delay: -5 },
  { icon: "fluent-emoji:sparkles", x: 55, y: 88, size: 16, dur: 9, delay: -7 },
  { icon: "fluent-emoji:cupcake", x: 20, y: 85, size: 18, dur: 12, delay: -2 },
  { icon: "fluent-emoji:chocolate-bar", x: 80, y: 25, size: 18, dur: 11, delay: -8 },
  { icon: "fluent-emoji:bagel", x: 35, y: 92, size: 20, dur: 10, delay: -4.5 },
  { icon: "fluent-emoji:hot-beverage", x: 15, y: 20, size: 18, dur: 14, delay: -1.5 },
] as const;

/* ── Rising steam particles ── */
const PARTICLES = Array.from({ length: 15 }, (_, i) => ({
  id: i,
  left: `${(i * 37 + 13) % 100}%`,
  size: 8 + ((i * 5) % 12),
  duration: 12 + ((i * 7) % 8),
  delay: -((i * 11) % 15),
  color: (["#ffffff", "#fefae0", "#faedcd"] as const)[i % 3],
}));

export default function CoffeeDateFrame({ padding, darkMode, transparent, children }: BaseFrameProps) {
  return (
    <div
      className={[styles.scene, darkMode ? styles.dark : styles.light, !transparent ? styles.transparent : ""].join(
        " ",
      )}
      style={{ padding }}
    >
      {/* ── Atmospheric blobs ── */}
      <div className={styles.blobMocha} aria-hidden />
      <div className={styles.blobCaramel} aria-hidden />
      <div className={styles.blobCream} aria-hidden />

      {/* ── Rising steam particles ── */}
      <div className={styles.particleLayer} aria-hidden>
        {PARTICLES.map((p) => (
          <div
            key={p.id}
            className={styles.particle}
            style={{
              left: p.left,
              width: p.size,
              height: p.size,
              background: p.color,
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
              y: [0, -12, 0],
              rotate: [0, i % 2 === 0 ? 8 : -8, 0],
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
            <Icon icon="fluent-emoji:hot-beverage" width={18} height={18} />
            <span className={styles.headerLabel}>coffee-date</span>
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
