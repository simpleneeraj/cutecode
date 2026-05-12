"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { XCircle, RefreshCcw, Home } from "lucide-react";

export default function CheckoutFailurePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center max-w-md w-full px-8 py-12 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl shadow-red-900/20 text-center"
      >
        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
          className="mb-6 rounded-full bg-red-500/20 p-4"
        >
          <XCircle className="w-16 h-16 text-red-400" strokeWidth={2.5} />
        </motion.div>

        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-4">
          Payment Failed
        </h1>
        
        <p className="text-gray-400 mb-8 leading-relaxed">
          We couldn&apos;t process your payment. Your card has not been charged. Please try again or use a different payment method.
        </p>

        <div className="flex flex-col gap-3 w-full">
          <Link href="/pricing" className="w-full">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full group flex items-center justify-center gap-2 rounded-xl bg-white text-black px-6 py-4 font-semibold transition-all hover:bg-gray-100 focus:ring-4 focus:ring-white/20"
            >
              <RefreshCcw className="w-5 h-5 transition-transform group-hover:-rotate-90" />
              Try again
            </motion.button>
          </Link>
          
          <Link href="/" className="w-full">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-transparent border border-white/10 text-white px-6 py-4 font-medium transition-all hover:bg-white/5 focus:ring-4 focus:ring-white/10"
            >
              <Home className="w-5 h-5" />
              Return home
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
