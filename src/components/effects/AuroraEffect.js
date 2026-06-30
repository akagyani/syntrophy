"use client";

import React from "react";
import { motion } from "framer-motion";

export default function AuroraEffect({ active = false }) {
  return (
    <div className="fixed inset-0 -z-20 overflow-hidden bg-[#050505] pointer-events-none">
      {/* Base ambient gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.03),transparent_70%)]" />

      {/* Aurora Blob 1 (Violet) */}
      <motion.div
        animate={{
          x: active ? [0, 40, -20, 0] : [0, 20, -10, 0],
          y: active ? [0, -60, 30, 0] : [0, -30, 15, 0],
          scale: active ? [1, 1.25, 0.9, 1] : [1, 1.1, 0.95, 1],
        }}
        transition={{
          duration: active ? 12 : 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-[20%] -left-[10%] h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.08)_0%,rgba(124,58,237,0.03)_50%,transparent_100%)] blur-[80px]"
      />

      {/* Aurora Blob 2 (Cyan) */}
      <motion.div
        animate={{
          x: active ? [0, -50, 30, 0] : [0, -25, 15, 0],
          y: active ? [0, 40, -50, 0] : [0, 20, -25, 0],
          scale: active ? [1, 1.2, 0.85, 1] : [1, 1.15, 0.9, 1],
        }}
        transition={{
          duration: active ? 15 : 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[30%] -right-[10%] h-[700px] w-[700px] rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.07)_0%,rgba(8,145,178,0.02)_60%,transparent_100%)] blur-[90px]"
      />

      {/* Aurora Blob 3 (Pulsing Center Glow when active) */}
      {active && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: [0.2, 0.45, 0.2],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[10%] left-[20%] right-[20%] bottom-[30%] -z-10 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.08)_0%,transparent_70%)] blur-[100px] pointer-events-none"
        />
      )}

      {/* Grid overlay for a premium tech feel */}
      <div 
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />
    </div>
  );
}
