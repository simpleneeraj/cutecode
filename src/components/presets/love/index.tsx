import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { BaseFrameProps } from "@/typings/presets";
import styles from "./love.module.css";
import sharedStyles from "../default/default.module.css";

/* ─────────────────────────────────────────
   Ambient floating icons — romantic set
   all from iconify (fluent + ph + solar sets)
───────────────────────────────────────── */
const AMBIENT_ICONS = [
  { icon: "fluent-emoji-flat:red-heart", x: 8, y: 10, size: 18, dur: 9, delay: 0 },
  { icon: "ph:star-four-fill", x: 88, y: 8, size: 13, dur: 11, delay: -2 },
  { icon: "fluent-emoji-flat:sparkles", x: 75, y: 78, size: 16, dur: 8, delay: -4 },
  { icon: "solar:heart-shine-bold", x: 5, y: 72, size: 15, dur: 10, delay: -1 },
  { icon: "ph:flower-lotus-fill", x: 50, y: 4, size: 14, dur: 12, delay: -6 },
  { icon: "fluent-emoji-flat:cherry-blossom", x: 92, y: 45, size: 17, dur: 9, delay: -3 },
  { icon: "solar:moon-stars-bold", x: 3, y: 38, size: 14, dur: 13, delay: -7 },
  { icon: "ph:shooting-star-fill", x: 60, y: 88, size: 15, dur: 8, delay: -5 },
  { icon: "fluent-emoji-flat:ribbon", x: 22, y: 88, size: 14, dur: 11, delay: -2.5 },
  { icon: "solar:heart-angle-bold", x: 80, y: 25, size: 13, dur: 10, delay: -8 },
  { icon: "ph:confetti-fill", x: 40, y: 92, size: 12, dur: 9, delay: -4.5 },
  { icon: "solar:gift-bold", x: 15, y: 20, size: 12, dur: 14, delay: -1.5 },
];

/* Floating particles */
const PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  left: `${(i * 41 + 7) % 100}%`,
  size: 2 + ((i * 5) % 20) / 10,
  duration: 10 + ((i * 11) % 14),
  delay: -((i * 7) % 18),
  icon: i % 3 === 0 ? "solar:heart-bold" : i % 3 === 1 ? "ph:star-four-fill" : null,
}));

/* Couple avatars */
const PERSON_A = {
  initials: "A",
  name: "Aria",
  icon: "solar:user-heart-rounded-bold",
  color: "#e8608a",
};
const PERSON_B = {
  initials: "L",
  name: "Leo",
  icon: "solar:user-heart-rounded-bold-duotone",
  color: "#a855f7",
};

export default function LoveFrame({ padding, darkMode, transparent, children }: BaseFrameProps) {
  const [heartbeat, setHeartbeat] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const hb = setInterval(() => {
      setHeartbeat(true);
      setTimeout(() => setHeartbeat(false), 300);
    }, 2200);
    const ct = setTimeout(() => setConnected(true), 1200);
    return () => {
      clearInterval(hb);
      clearTimeout(ct);
    };
  }, []);

  return (
    <div
      className={[styles.scene, darkMode ? styles.dark : styles.light, !transparent ? styles.transparent : ""].join(
        " ",
      )}
      style={{ padding }}
    >
      {!transparent && <div data-ignore-in-export className={sharedStyles.transparentPattern} />}

      {/* Background blobs */}
      {transparent && (
        <>
          <div className={styles.blobA} aria-hidden />
          <div className={styles.blobB} aria-hidden />
          <div className={styles.blobC} aria-hidden />
        </>
      )}

      {/* Particle layer */}
      {transparent && (
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
                background: p.id % 2 === 0 ? "#e8608a" : "#a855f7",
              }}
            />
          ))}
        </div>
      )}

      {/* Ambient icons */}
      {transparent && (
        <div className={styles.ambientLayer} aria-hidden>
          {AMBIENT_ICONS.map((a, i) => (
            <motion.span
              key={i}
              className={styles.ambientIcon}
              style={{ left: `${a.x}%`, top: `${a.y}%` }}
              animate={{ y: [0, -14, 0], rotate: [0, i % 2 === 0 ? 15 : -15, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: a.dur, repeat: Infinity, ease: "easeInOut", delay: a.delay }}
            >
              <Icon icon={a.icon} width={a.size} height={a.size} />
            </motion.span>
          ))}
        </div>
      )}

      {/* Main window */}
      <motion.div
        className={styles.window}
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Shimmer top edge */}
        <div className={styles.shimmerEdge} aria-hidden />

        {/* ── HEADER ── */}
        <div className={styles.header}>
          {/* Person A */}
          <div className={styles.person}>
            <motion.div
              className={styles.avatar}
              style={{ "--avatar-color": PERSON_A.color } as React.CSSProperties}
              whileHover={{ scale: 1.08 }}
            >
              <Icon icon={PERSON_A.icon} width={20} height={20} />
            </motion.div>
            <span className={styles.personName}>{PERSON_A.name}</span>
          </div>

          {/* Center connection indicator */}
          <div className={styles.headerCenter}>
            <div className={styles.connectionLine}>
              <AnimatePresence>
                {connected && (
                  <motion.div
                    className={styles.connectionDot}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  />
                )}
              </AnimatePresence>
              <div className={styles.connLine} />
              <motion.div
                className={styles.heartIcon}
                animate={heartbeat ? { scale: 1.35 } : { scale: 1 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                <Icon icon="solar:heart-shine-bold" width={22} height={22} color="#e8608a" />
              </motion.div>
              <div className={styles.connLine} />
              <AnimatePresence>
                {connected && (
                  <motion.div
                    className={styles.connectionDot}
                    style={{ background: "#a855f7" }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
                  />
                )}
              </AnimatePresence>
            </div>
            <span className={styles.headerLabel}>
              <Icon icon="fluent-emoji-flat:red-heart" width={10} height={10} style={{ marginRight: 4 }} />
              love.ts
              <Icon icon="fluent-emoji-flat:red-heart" width={10} height={10} style={{ marginLeft: 4 }} />
            </span>
          </div>

          {/* Person B */}
          <div className={styles.person} style={{ flexDirection: "row-reverse" }}>
            <motion.div
              className={styles.avatar}
              style={{ "--avatar-color": PERSON_B.color } as React.CSSProperties}
              whileHover={{ scale: 1.08 }}
            >
              <Icon icon={PERSON_B.icon} width={20} height={20} />
            </motion.div>
            <span className={styles.personName}>{PERSON_B.name}</span>
          </div>
        </div>

        {/* Header bottom rule */}
        <div className={styles.headerRule} aria-hidden />

        {/* ── EDITOR ── */}
        <div className={styles.editor}>{children}</div>

        {/* ── STATUS BAR ── */}
        <div className={styles.statusBar}>
          <div className={styles.statusLeft}>
            <span className={styles.statusPill}>
              <Icon icon="vscode-icons:file-type-typescript-official" width={11} height={11} />
              TypeScript
            </span>
            <span className={styles.statusPill} style={{ background: "rgba(232,96,138,0.12)", color: "#e8608a" }}>
              <Icon icon="solar:heart-pulse-bold" width={11} height={11} />
              in love
            </span>
          </div>
          <div className={styles.statusRight}>
            <Icon icon="solar:infinity-bold" width={11} height={11} style={{ opacity: 0.5 }} />
            <span>forever · UTF-8</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
