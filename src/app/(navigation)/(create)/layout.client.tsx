"use client";

import React from "react";
import { motion } from "framer-motion";
import View from "@/components/view";
import { Header } from "../components/header";

export default function CodeLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <View className="layout-fill" style={{ position: "relative", overflow: "hidden" }}>
      {/* ── Mesh background (dot grid + drifting blobs) ── */}
      <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: -1, pointerEvents: "none" }}>
        {/* Dot grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(circle, var(--gray-a4) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Blob — top-left */}
        <motion.div
          style={{
            position: "absolute",
            width: 640,
            height: 640,
            borderRadius: "50%",
            background: "radial-gradient(circle, var(--gray-a3) 0%, transparent 70%)",
            top: "-20%",
            left: "-12%",
          }}
          animate={{ x: [0, 55, 0], y: [0, 35, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Blob — bottom-right */}
        <motion.div
          style={{
            position: "absolute",
            width: 520,
            height: 520,
            borderRadius: "50%",
            background: "radial-gradient(circle, var(--gray-a3) 0%, transparent 70%)",
            bottom: "-18%",
            right: "-12%",
          }}
          animate={{ x: [0, -45, 0], y: [0, -30, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Blob — center */}
        <motion.div
          style={{
            position: "absolute",
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: "radial-gradient(circle, var(--gray-a2) 0%, transparent 70%)",
            top: "35%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
          animate={{ x: [0, 30, -20, 0], y: [0, -20, 15, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <Header />
      {children}
    </View>
  );
}
