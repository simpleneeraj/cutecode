import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import styles from "./style.module.css";
import { BaseFrameProps } from "@/typings/presets";

/* ─────────────────────────────────────────────────────────────
   Cotton Candy Frame
   Palette  → bubblegum pink × powder blue × lavender × cream
   Font     → rounded mono (code) + playful italic headings
   Cursor   → mint green with candy glow
   Vibe     → kawaii fair stall, spun sugar, pastel carnival
───────────────────────────────────────────────────────────── */

/* ── Ambient icons — carnival / kawaii set ── */
const AMBIENT_ICONS = [
  { icon: "fluent-emoji:cotton-candy", x: 5, y: 6, size: 24, dur: 9, delay: 0 },
  { icon: "fluent-emoji:lollipop", x: 88, y: 5, size: 20, dur: 11, delay: -3 },
  { icon: "fluent-emoji:star", x: 78, y: 78, size: 16, dur: 8, delay: -5 },
  { icon: "fluent-emoji:cloud", x: 4, y: 70, size: 22, dur: 10, delay: -1 },
  { icon: "fluent-emoji:balloon", x: 46, y: 2, size: 20, dur: 12, delay: -7 },
  { icon: "fluent-emoji:cherry-blossom", x: 90, y: 42, size: 16, dur: 9, delay: -4 },
  { icon: "fluent-emoji:cupcake", x: 2, y: 38, size: 18, dur: 11, delay: -2 },
  { icon: "fluent-emoji:rainbow", x: 55, y: 91, size: 20, dur: 8, delay: -6 },
  { icon: "fluent-emoji:sparkles", x: 20, y: 88, size: 16, dur: 13, delay: -2.5 },
  { icon: "fluent-emoji:unicorn", x: 82, y: 20, size: 18, dur: 10, delay: -8 },
  { icon: "fluent-emoji:strawberry", x: 38, y: 95, size: 15, dur: 9, delay: -4.5 },
  { icon: "fluent-emoji:ice-cream", x: 14, y: 16, size: 16, dur: 14, delay: -1.5 },
] as const;

/* ── Rising sugar particles ── */
const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: `${(i * 43 + 9) % 100}%`,
  size: 2.5 + ((i * 7) % 22) / 10,
  duration: 9 + ((i * 11) % 13),
  delay: -((i * 7) % 17),
  color: (["#ffb3d9", "#b3d9ff", "#d9b3ff", "#b3ffdc"] as const)[i % 4],
}));
/* ─────────────────────────────────────────────────────────────
   Component
───────────────────────────────────────────────────────────── */
export default function CottonCandyFrame({ padding, darkMode, transparent, children }: BaseFrameProps) {
  return (
    <div
      className={[styles.scene, darkMode ? styles.dark : styles.light, transparent ? styles.transparent : ""].join(" ")}
      style={{ padding }}
    >
      {/* ── Atmospheric blobs ── */}
      <div className={styles.blobPink} aria-hidden />
      <div className={styles.blobBlue} aria-hidden />
      <div className={styles.blobPurple} aria-hidden />

      {/* ── Rising sugar particles ── */}
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
              y: [0, -14, 0],
              rotate: [0, i % 2 === 0 ? 10 : -10, 0],
              scale: [1, 1.08, 1],
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
        {/* Candy-stripe top edge */}
        <div className={styles.candyStripe} aria-hidden />

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
            <Icon icon="fluent-emoji:cotton-candy" width={18} height={18} />
            <span className={styles.headerLabel}>cotton-candy</span>
          </div>

          {/* Right accent */}
          <div className={styles.headerRight}>
            <Icon icon="fluent-emoji:sparkles" width={16} height={16} />
          </div>
        </div>

        {/* Pastel divider rule */}
        <div className={styles.headerRule} aria-hidden />

        {/* ── Code editor ── */}
        <div className={styles.editor}>{children}</div>

        {/* ── Status bar ── */}
        <div className={styles.statusBar}>
          <div className={styles.statusLeft}>
            <span className={styles.statusPill}>
              <Icon icon="vscode-icons:file-type-typescript-official" width={11} height={11} />
              TypeScript
            </span>
            <span className={styles.statusPillCandy}>
              <Icon icon="fluent-emoji:lollipop" width={11} height={11} />
              Cotton Candy
            </span>
          </div>

          <div className={styles.statusRight}>
            <Icon icon="fluent-emoji:rainbow" width={11} height={11} />
            <span>sweet · UTF-8</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
