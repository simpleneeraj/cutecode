import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/icon";
import { BaseFrameProps } from "@/typings/presets";
import styles from "./valentine.module.css";

/* ─────────────────────────────────────────
   Ambient icons — Valentine's set
───────────────────────────────────────── */
const AMBIENT_ICONS = [
  { icon: "noto:heart-suit", x: 6, y: 7, size: 20, dur: 8, delay: 0 },
  { icon: "noto:bouquet", x: 87, y: 6, size: 22, dur: 10, delay: -3 },
  { icon: "noto:love-letter", x: 4, y: 68, size: 20, dur: 9, delay: -5 },
  { icon: "noto:rose", x: 90, y: 70, size: 20, dur: 11, delay: -2 },
  { icon: "noto:ribbon", x: 46, y: 3, size: 18, dur: 12, delay: -7 },
  { icon: "noto:cherry-blossom", x: 78, y: 40, size: 16, dur: 8, delay: -4 },
  { icon: "noto:sparkling-heart", x: 2, y: 38, size: 17, dur: 10, delay: -1 },
  { icon: "noto:beating-heart", x: 55, y: 90, size: 18, dur: 9, delay: -6 },
  { icon: "noto:two-hearts", x: 20, y: 85, size: 16, dur: 13, delay: -2.5 },
  { icon: "noto:heart-with-arrow", x: 82, y: 22, size: 17, dur: 10, delay: -8 },
  { icon: "noto:candy", x: 38, y: 94, size: 15, dur: 8, delay: -4.5 },
  { icon: "noto:wrapped-gift", x: 14, y: 18, size: 16, dur: 14, delay: -1.5 },
];

/* Petals / hearts particles */
const PARTICLES = Array.from({ length: 26 }, (_, i) => ({
  id: i,
  left: `${(i * 37 + 13) % 100}%`,
  size: 3 + ((i * 6) % 18) / 10,
  duration: 8 + ((i * 9) % 12),
  delay: -((i * 6) % 16),
  hue: i % 3 === 0 ? "#ff6b9d" : i % 3 === 1 ? "#ff4d6d" : "#ffb3c6",
}));

/* Envelope open/close state */
const EnvelopeIcon = ({ open }: { open: boolean }) => (
  <AnimatePresence mode="wait">
    <motion.span
      key={open ? "open" : "closed"}
      initial={{ scale: 0.8, opacity: 0, rotateX: -90 }}
      animate={{ scale: 1, opacity: 1, rotateX: 0 }}
      exit={{ scale: 0.8, opacity: 0, rotateX: 90 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{ display: "flex" }}
    >
      <Icon icon={open ? "noto:envelope-with-arrow" : "noto:love-letter"} width={22} height={22} />
    </motion.span>
  </AnimatePresence>
);

export default function ValentineFrame({ padding, darkMode, transparent, children }: BaseFrameProps) {
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [stamp, setStamp] = useState(false);

  useEffect(() => {
    /* Heartbeat */
    const hb = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 350);
    }, 1800);

    /* Envelope toggle */
    const ev = setInterval(() => {
      setEnvelopeOpen((v) => !v);
    }, 3200);

    /* Stamp appears */
    const st = setTimeout(() => setStamp(true), 900);

    return () => {
      clearInterval(hb);
      clearInterval(ev);
      clearTimeout(st);
    };
  }, []);

  return (
    <div
      className={[styles.scene, darkMode ? styles.dark : styles.light, transparent ? styles.transparent : ""].join(
        " ",
      )}
      style={{ padding }}
    >
      {/* Background blobs */}
      <div className={styles.blobA} aria-hidden />
      <div className={styles.blobB} aria-hidden />
      <div className={styles.blobC} aria-hidden />

      {/* Lace border pattern */}
      <div className={styles.laceBorder} aria-hidden />

      {/* Particles */}
      <div className={styles.particleLayer} aria-hidden>
        {PARTICLES.map((p) => (
          <div
            key={p.id}
            className={styles.particle}
            style={{
              left: p.left,
              width: p.size,
              height: p.size,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              background: p.hue,
            }}
          />
        ))}
      </div>

      {/* Ambient icons */}
      <div className={styles.ambientLayer} aria-hidden>
        {AMBIENT_ICONS.map((a, i) => (
          <motion.span
            key={i}
            className={styles.ambientIcon}
            style={{ left: `${a.x}%`, top: `${a.y}%` }}
            animate={{
              y: [0, -16, 0],
              rotate: [0, i % 2 === 0 ? 12 : -12, 0],
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

      {/* Window */}
      <motion.div
        className={styles.window}
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Top shimmer */}
        <div className={styles.shimmerEdge} aria-hidden />

        {/* ── HEADER ── */}
        <div className={styles.header}>
          {/* Left — envelope */}
          <div className={styles.headerLeft}>
            <motion.div
              className={styles.envelopeWrap}
              whileHover={{ scale: 1.1, rotate: -5 }}
              onClick={() => setEnvelopeOpen((v) => !v)}
            >
              <EnvelopeIcon open={envelopeOpen} />
            </motion.div>
            <div className={styles.headerMeta}>
              <span className={styles.headerTo}>
                To: <em>You</em>
              </span>
              <span className={styles.headerFrom}>
                From: <em>Always Me</em>
              </span>
            </div>
          </div>

          {/* Center — title + heartbeat */}
          <div className={styles.headerCenter}>
            <motion.div
              animate={pulse ? { scale: 1.4 } : { scale: 1 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={styles.mainHeart}
            >
              <Icon icon="noto:beating-heart" width={28} height={28} />
            </motion.div>
            <span className={styles.headerTitle}>valentine.ts</span>
          </div>

          {/* Right — postage stamp */}
          <div className={styles.headerRight}>
            <AnimatePresence>
              {stamp && (
                <motion.div
                  className={styles.postageStamp}
                  initial={{ scale: 0, rotate: 15, opacity: 0 }}
                  animate={{ scale: 1, rotate: 6, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
                >
                  <Icon icon="noto:rose" width={20} height={20} />
                  <span className={styles.stampLabel}>LOVE</span>
                  <span className={styles.stampDate}>XIV · II</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Header divider — lace-like rule */}
        <div className={styles.laceRule} aria-hidden />

        {/* ── EDITOR ── */}
        <div className={styles.editor}>{children}</div>

        {/* ── STATUS BAR ── */}
        <div className={styles.statusBar}>
          <div className={styles.statusLeft}>
            <span className={styles.statusPill}>
              <Icon icon="vscode-icons:file-type-typescript-official" width={11} height={11} />
              TypeScript
            </span>
            <span className={styles.statusPillRose}>
              <Icon icon="noto:rose" width={11} height={11} />
              Valentine's Day
            </span>
          </div>
          <div className={styles.statusRight}>
            <Icon icon="noto:two-hearts" width={11} height={11} />
            <span>xoxo · UTF-8</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
