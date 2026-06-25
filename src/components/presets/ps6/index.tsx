import { motion } from "framer-motion";
import { Icon } from "@/components/ui/icon";
import { BaseFrameProps } from "@/typings/presets";
import styles from "./ps6.module.css";

const AMBIENT = [
  { icon: "solar:triangle-bold", x: 8, y: 8, size: 16, dur: 9, delay: 0, color: "#78e8b8" },
  { icon: "solar:circle-bold", x: 88, y: 6, size: 15, dur: 11, delay: -3, color: "#f07898" },
  { icon: "solar:square-bold", x: 5, y: 72, size: 14, dur: 10, delay: -5, color: "#f0a030" },
  { icon: "ph:x-square-fill", x: 90, y: 70, size: 14, dur: 12, delay: -2, color: "#7898f0" },
  { icon: "solar:triangle-bold", x: 48, y: 3, size: 12, dur: 8, delay: -7, color: "#78e8b8" },
  { icon: "solar:circle-bold", x: 78, y: 42, size: 13, dur: 9, delay: -4, color: "#f07898" },
  { icon: "solar:square-bold", x: 2, y: 40, size: 12, dur: 11, delay: -1, color: "#f0a030" },
  { icon: "ph:x-square-fill", x: 55, y: 90, size: 13, dur: 10, delay: -6, color: "#7898f0" },
] as const;

const PARTICLES = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  left: `${(i * 47 + 11) % 100}%`,
  size: 1.5 + ((i * 5) % 18) / 10,
  dur: 10 + ((i * 9) % 12),
  delay: -((i * 6) % 15),
  color: (["#78e8b8", "#f07898", "#f0a030", "#7898f0"] as const)[i % 4],
}));

export default function PS6Frame({ padding, darkMode, transparent, children }: BaseFrameProps) {
  return (
    <div
      className={[styles.scene, darkMode ? styles.dark : styles.light, transparent ? styles.transparent : ""].join(
        " ",
      )}
      style={{ padding }}
    >
      {/* Blobs */}
      <div className={styles.blobBlue} aria-hidden />
      <div className={styles.blobPurple} aria-hidden />
      <div className={styles.blobTeal} aria-hidden />

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
              background: p.color,
              animationDuration: `${p.dur}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Ambient icons */}
      <div className={styles.ambientLayer} aria-hidden>
        {AMBIENT.map((a, i) => (
          <motion.span
            key={i}
            className={styles.ambientIcon}
            style={{ left: `${a.x}%`, top: `${a.y}%`, color: a.color }}
            animate={{ y: [0, -12, 0], rotate: [0, i % 2 === 0 ? 15 : -15, 0] }}
            transition={{ duration: a.dur, repeat: Infinity, ease: "easeInOut", delay: a.delay }}
          >
            <Icon icon={a.icon} width={a.size} height={a.size} />
          </motion.span>
        ))}
      </div>

      {/* Window */}
      <motion.div
        className={styles.window}
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className={styles.shimmerEdge} aria-hidden />

        {/* Header */}
        <div className={styles.header}>
          {/* PS symbols — triangle, circle, square */}
          <div className={styles.symbols}>
            {(
              [
                { icon: "ph:triangle", cls: styles.symTriangle, color: "#78e8b8" },
                { icon: "ph:circle", cls: styles.symCircle, color: "#f07898" },
                { icon: "ph:square", cls: styles.symSquare, color: "#f0a030" },
              ] as const
            ).map(({ icon, cls, color }) => (
              <motion.span
                key={icon}
                className={`${styles.sym} ${cls}`}
                whileHover={{ scale: 1.25, filter: `drop-shadow(0 0 5px ${color})` }}
                transition={{ duration: 0.15 }}
              >
                <Icon icon={icon} width={14} height={14} color={color} />
              </motion.span>
            ))}
          </div>

          {/* Center */}
          <div className={styles.headerCenter}>
            <Icon icon="simple-icons:playstation" width={16} height={16} className={styles.psLogo} />
            <span className={styles.headerLabel}>ps6.config.ts</span>
          </div>

          {/* Right */}
          <div className={styles.headerRight}>
            <Icon icon="solar:gamepad-bold" width={16} height={16} />
          </div>
        </div>

        <div className={styles.headerRule} aria-hidden />

        {/* Editor */}
        <div className={styles.editor}>{children}</div>

        {/* Status bar */}
        <div className={styles.statusBar}>
          <div className={styles.statusLeft}>
            <span className={styles.pill}>
              <Icon icon="vscode-icons:file-type-typescript-official" width={11} height={11} />
              TypeScript
            </span>
            <span className={`${styles.pill} ${styles.pillPs}`}>
              <Icon icon="simple-icons:playstation" width={10} height={10} />
              PS6
            </span>
          </div>
          <div className={styles.statusRight}>
            <Icon icon="solar:gamepad-bold" width={10} height={10} style={{ opacity: 0.4 }} />
            <span>UTF-8</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
