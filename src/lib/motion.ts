import type { MotionProps, Transition, Variants } from "motion/react";

export const SPRING: Transition = { type: "spring", stiffness: 400, damping: 30 };

// Matches the cubic-bezier used throughout globals.css animations
export const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const FADE_IN: Pick<MotionProps, "initial" | "animate"> = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

export const SLIDE_UP: Pick<MotionProps, "initial" | "animate"> = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};

export const SLIDE_DOWN: Pick<MotionProps, "initial" | "animate"> = {
  initial: { opacity: 0, y: -8 },
  animate: { opacity: 1, y: 0 },
};

export const SCALE_IN: Pick<MotionProps, "initial" | "animate"> = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.04 },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { ease: EASE_OUT, duration: 0.3 } },
};
