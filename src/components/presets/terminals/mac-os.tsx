import { useState } from "react";
import { Icon } from "@iconify/react";
import { BaseFrameProps } from "@/typings/presets";
import styles from "./terminals.module.css";

/* ── Prompt segments ── */
const PROMPT = {
  user: "user",
  host: "macbook",
  path: "~/projects/app",
  branch: "main",
};

export default function MacOSTerminalFrame({ padding, darkMode, transparent, children }: BaseFrameProps) {
  return (
    <div
      className={[styles.scene, darkMode ? styles.dark : styles.light, transparent ? styles.transparent : ""].join(
        " ",
      )}
      style={{ padding }}
    >
      {/* Glass noise texture */}
      <div className={styles.noise} aria-hidden />

      <div className={styles.window}>
        {/* Scanline overlay */}
        <div className={styles.scanlines} aria-hidden />

        {/* ── Titlebar ── */}
        <div className={styles.titlebar}>
          {/* Traffic lights */}
          <div className={styles.trafficLights}>
            <button className={`${styles.light} ${styles.lightRed}`} aria-label="Close" />
            <button className={`${styles.light} ${styles.lightYellow}`} aria-label="Minimise" />
            <button className={`${styles.light} ${styles.lightGreen}`} aria-label="Zoom" />
          </div>
        </div>

        {/* ── Toolbar: path breadcrumb + git ── */}
        <div className={styles.toolbar}>
          <div className={styles.breadcrumb}>
            <Icon icon="ph:house-simple" width={11} height={11} className={styles.breadHome} />
            <span className={styles.breadSep}>/</span>
            <span className={styles.breadSeg}>projects</span>
            <span className={styles.breadSep}>/</span>
            <span className={`${styles.breadSeg} ${styles.breadCurrent}`}>app</span>
          </div>

          <div className={styles.toolbarRight}>
            <span className={styles.gitBadge}>
              <Icon icon="devicon:git" width={11} height={11} />
              <span>{PROMPT.branch}</span>
              <span className={styles.gitAhead}>↑2</span>
            </span>
            <span className={styles.toolSep} />
            <Icon icon="ph:magnifying-glass" width={13} height={13} className={styles.toolIcon} />
            <Icon icon="ph:terminal" width={13} height={13} className={styles.toolIcon} />
          </div>
        </div>

        {/* ── Terminal body ── */}
        <div className={styles.body}>
          {/* Prompt line */}
          <div className={styles.promptLine}>
            <span className={styles.promptUser}>{PROMPT.user}</span>
            <span className={styles.promptAt}>@</span>
            <span className={styles.promptHost}>{PROMPT.host}</span>
            <span className={styles.promptSpace}> </span>
            <span className={styles.promptPath}>{PROMPT.path}</span>
            <span className={styles.promptSpace}> </span>
            <span className={styles.promptBranch}>
              <Icon icon="ph:git-branch" width={11} height={11} />
              {PROMPT.branch}
            </span>
            <span className={styles.promptArrow}> ❯</span>
          </div>

          {/* Children — the actual code/output */}
          <div className={styles.content}>{children}</div>
        </div>

        {/* ── Status bar ── */}
        <div className={styles.statusBar}>
          <div className={styles.statusLeft}>
            <span className={styles.statusItem}>
              <Icon icon="ph:terminal" width={10} height={10} />
              zsh 5.9
            </span>
            <span className={styles.statusDivider} />
            <span className={styles.statusItem}>
              <Icon icon="ph:cpu" width={10} height={10} />
              12%
            </span>
            <span className={styles.statusDivider} />
            <span className={styles.statusItem}>
              <Icon icon="devicon:git" width={10} height={10} />
              main ✓
            </span>
          </div>
          <div className={styles.statusRight}>
            <span className={styles.statusItem}>UTF-8</span>
            <span className={styles.statusDivider} />
            <span className={styles.statusItem}>
              <Icon icon="ph:clock" width={10} height={10} />
              {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
