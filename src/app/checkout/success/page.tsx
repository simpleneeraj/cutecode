"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { useWindowSize } from "react-use";
import Confetti from "react-confetti";
import { useEffect, useState } from "react";

export default function CheckoutSuccessPage() {
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.15}
          colors={['#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b']}
        />
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center max-w-md w-full px-8 py-12 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl shadow-emerald-900/20 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
          className="mb-6 rounded-full bg-emerald-500/20 p-4"
        >
          <CheckCircle2 className="w-16 h-16 text-emerald-400" strokeWidth={2.5} />
        </motion.div>

        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-4">
          Payment Successful
        </h1>
        
        <p className="text-gray-400 mb-8 leading-relaxed">
          Thank you for your purchase! Your subscription is now active and all premium features have been unlocked.
        </p>

        <Link href="/" className="w-full">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full group flex items-center justify-center gap-2 rounded-xl bg-white text-black px-6 py-4 font-semibold transition-all hover:bg-gray-100 focus:ring-4 focus:ring-white/20"
          >
            Start creating
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}
