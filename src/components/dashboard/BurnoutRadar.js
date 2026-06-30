"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldAlert, TrendingUp } from "lucide-react";

export default function BurnoutRadar() {
  // 5 days predictive workload
  const forecast = [
    { day: "Mon", workload: 85, status: "Critical", color: "bg-red-500 shadow-red-500/30" },
    { day: "Tue", workload: 78, status: "High Alert", color: "bg-amber-500 shadow-amber-500/30" }, // TODAY
    { day: "Wed", workload: 45, status: "Balanced", color: "bg-[#06b6d4] shadow-cyan-500/30" },
    { day: "Thu", workload: 60, status: "Moderate", color: "bg-indigo-500 shadow-indigo-500/30" },
    { day: "Fri", workload: 35, status: "Restorative", color: "bg-emerald-500 shadow-emerald-500/30" }
  ];

  return (
    <div className="glass-panel rounded-2xl p-5 border border-zinc-800/60 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
          <ShieldAlert size={16} className="text-[#8b5cf6]" />
          5-Day Burnout Radar
        </h3>
        <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1 uppercase">
          <TrendingUp size={12} className="text-amber-500" />
          Predictive Load
        </span>
      </div>

      <p className="text-[11px] text-zinc-400 leading-relaxed mb-6">
        Syntropy predicts a major overload today (78%) and yesterday (85%). Wed-Fri workloads have been optimized using auto-negotiation, moving Sarah&apos;s 1:1 and spreading submission tasks.
      </p>

      {/* Heat map blocks */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-3 h-32 items-end">
        {forecast.map((f, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 h-full justify-end">
            <span className="text-[8px] sm:text-[9px] text-zinc-500 font-mono">{f.workload}%</span>
            
            {/* Pulsing bar */}
            <div className="w-full bg-zinc-900 rounded-lg h-20 relative overflow-hidden border border-zinc-800/20">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${f.workload}%` }}
                transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                className={`absolute bottom-0 left-0 right-0 rounded-t-md shadow-lg ${f.color}`}
              />
            </div>
            
            <span className={`text-[9px] sm:text-[10px] font-bold ${f.day === "Tue" ? "text-white underline decoration-[#8b5cf6] decoration-2 underline-offset-4" : "text-zinc-400"}`}>
              {f.day}
            </span>
          </div>
        ))}
      </div>

      {/* Burnout Mitigation Indicator */}
      <div className="mt-5 p-3 rounded-xl bg-[#8b5cf6]/5 border border-[#8b5cf6]/10 flex items-center gap-3">
        <div className="h-2 w-2 rounded-full bg-[#8b5cf6] animate-ping" />
        <span className="text-[10px] font-mono text-[#a78bfa]">
          AUTO-OPTIMIZATION ACTIVE: 4.5 hours of focus time secured.
        </span>
      </div>
    </div>
  );
}
