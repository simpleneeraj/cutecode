"use client";

import Link from "next/link";
import { useState } from "react";
import Confetti from "react-confetti";
import { useRouter } from "next/navigation";
import { useInterval, useWindowSize } from "react-use";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";

const REDIRECT_SECONDS = 5;

export default function CheckoutSuccessClient() {
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);
  const router = useRouter();

  useInterval(
    () => {
      setShowConfetti(false);
    },
    showConfetti ? 6000 : null,
  );

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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-emerald-500/8 blur-[140px] rounded-full" />
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-teal-500/6 blur-[100px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-green-500/6 blur-[80px] rounded-full" />
      </div>

      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={600}
          gravity={0.12}
          colors={["#10b981", "#34d399", "#6ee7b7", "#3b82f6", "#8b5cf6", "#f59e0b"]}
        />
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col items-center w-full max-w-md"
      >
        {/* Card */}
        <div className="w-full rounded-3xl bg-white/4 border border-white/10 backdrop-blur-2xl shadow-2xl shadow-emerald-900/20 overflow-hidden">
          {/* Top glow strip */}
          <div className="h-px w-full bg-linear-to-r from-transparent via-emerald-400/60 to-transparent" />

          <div className="px-8 py-10 flex flex-col items-center text-center gap-6">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 220, damping: 16 }}
              className="relative"
            >
              <div className="size-24 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="size-12 text-emerald-400" strokeWidth={1.5} />
              </div>
              {/* Orbiting sparkle */}
              <motion.div
                className="absolute -top-1 -right-1"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="size-5 text-amber-400" />
              </motion.div>
            </motion.div>

            {/* Text */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="space-y-2"
            >
              <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-b from-white to-white/70">
                You&apos;re all set! 🎉
              </h1>
              <p className="text-white/50 text-sm leading-relaxed">
                Your Pro subscription is now active. Enjoy unlimited exports, premium themes, and no watermarks.
              </p>
            </motion.div>

            {/* Features unlocked */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="w-full grid grid-cols-2 gap-2"
            >
              {["Unlimited exports", "HD & Ultra HD", "No watermark", "All themes"].map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-2 rounded-xl bg-emerald-500/8 border border-emerald-500/15 px-3 py-2"
                >
                  <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                  <span className="text-xs text-white/70 font-medium">{feature}</span>
                </div>
              ))}
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
                  className="h-full rounded-full bg-linear-to-r from-emerald-500 to-teal-400"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
              <p className="text-xs text-white/35">
                Redirecting to editor in{" "}
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

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="w-full"
            >
              <Link href="/" className="w-full block">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full group flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3.5 font-semibold text-sm transition-colors"
                >
                  Start creating now
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
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
          A confirmation email is on its way to your inbox.
        </motion.p>
      </motion.div>
    </div>
  );
}
