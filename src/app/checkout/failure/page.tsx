"use client";

import Link from "next/link";
import { useState } from "react";
import { useInterval } from "react-use";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { CloseCircle, RefreshCircle, Home, DangerTriangle } from "@solar-icons/react";

const REDIRECT_SECONDS = 8;

export default function CheckoutFailurePage() {
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);
  const router = useRouter();

  useInterval(() => {
    if (countdown <= 0) {
      router.push("/");
    } else {
      setCountdown((c) => c - 1);
    }
  }, 1000);

  const progress = ((REDIRECT_SECONDS - countdown) / REDIRECT_SECONDS) * 100;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white relative overflow-hidden p-4">
      {/* Layered background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-red-500/8 blur-[140px] rounded-full" />
        <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-orange-500/6 blur-[80px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col items-center w-full max-w-md"
      >
        {/* Card */}
        <div className="w-full rounded-3xl bg-white/4 border border-white/10 backdrop-blur-2xl shadow-2xl shadow-red-900/20 overflow-hidden">
          {/* Top glow strip */}
          <div className="h-px w-full bg-linear-to-r from-transparent via-red-400/60 to-transparent" />

          <div className="px-8 py-10 flex flex-col items-center text-center gap-6">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0, rotate: 30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 220, damping: 16 }}
            >
              <div className="size-24 rounded-full bg-red-500/15 border border-red-500/20 flex items-center justify-center">
                <CloseCircle weight="BoldDuotone" className="size-12 text-red-400" aria-hidden="true" />
              </div>
            </motion.div>

            {/* Text */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="space-y-2"
            >
              <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-b from-white to-white/70">
                Payment Failed
              </h1>
              <p className="text-white/50 text-sm leading-relaxed">
                We couldn&apos;t process your payment. Your card has{" "}
                <strong className="text-white/70">not been charged</strong>. Please try again or use a different payment
                method.
              </p>
            </motion.div>

            {/* Reason hint */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="w-full flex items-start gap-3 rounded-2xl bg-amber-500/8 border border-amber-500/15 px-4 py-3 text-left"
            >
              <DangerTriangle weight="LineDuotone" className="size-4 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-xs text-white/55 leading-relaxed">
                Common reasons: insufficient funds, card expired, or bank declined the transaction. Contact your bank if
                the issue persists.
              </p>
            </motion.div>

            {/* Progress + countdown */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="w-full space-y-2"
            >
              <div className="h-1 w-full rounded-full bg-white/8 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-linear-to-r from-red-500 to-orange-400"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
              <p className="text-xs text-white/35">
                Redirecting home in{" "}
                <AnimatePresence mode="wait">
                  <motion.span
                    key={countdown}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.2 }}
                    className="inline-block font-semibold text-white/60"
                  >
                    {countdown}s
                  </motion.span>
                </AnimatePresence>
              </p>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="w-full flex flex-col gap-2.5"
            >
              <Link href="/" className="w-full block">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full group flex items-center justify-center gap-2 rounded-2xl bg-white hover:bg-white/90 text-black px-6 py-3.5 font-semibold text-sm transition-colors"
                >
                  <RefreshCircle weight="LineDuotone" className="size-4 transition-transform group-hover:-rotate-180 duration-500" aria-hidden="true" />
                  Try again
                </motion.button>
              </Link>

              <Link href="/" className="w-full block">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full group flex items-center justify-center gap-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white px-6 py-3.5 font-medium text-sm transition-all"
                >
                  <Home weight="LineDuotone" className="size-4" aria-hidden="true" />
                  Return home
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Sub-label */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-4 text-xs text-white/25 text-center"
        >
          Need help? Email us at{" "}
          <a
            href="mailto:support@cutecode.app"
            className="text-white/40 underline hover:text-white/60 transition-colors"
          >
            support@cutecode.app
          </a>
        </motion.p>
      </motion.div>
    </div>
  );
}
