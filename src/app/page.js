"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, Brain, Clock, ShieldAlert, Key } from "lucide-react";
import AuroraEffect from "../components/effects/AuroraEffect";
import ParticleField from "../components/effects/ParticleField";
import { useAuth } from "../context/AuthContext";

export default function LandingPage() {
  const router = useRouter();
  const { user, loading, loginWithGoogle } = useAuth();

  useEffect(() => {
    if (user && !loading) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleLogin = async () => {
    await loginWithGoogle();
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-between overflow-hidden">
      {/* Background Visual Effects */}
      <AuroraEffect active={true} />
      <ParticleField />

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-[radial-gradient(circle_at_top_left,#8b5cf6,#06b6d4)] flex items-center justify-center shadow-lg shadow-[#8b5cf6]/20">
            <span className="text-black font-extrabold text-base">S</span>
          </div>
          <div>
            <h1 className="font-bold text-base tracking-wider text-white">SYNTROPY</h1>
            <span className="text-[9px] font-mono tracking-widest text-[#06b6d4] block -mt-1">
              SYSTEM OF AGENCY
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-zinc-500">
          <span>VIBECODE 2.0 MVP</span>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 flex flex-col items-center justify-center text-center z-10 space-y-10 py-16">
        <div className="space-y-4 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-[#8b5cf6]/10 text-[#a78bfa] border border-[#8b5cf6]/20 mb-4">
              <Sparkles size={12} className="animate-pulse" />
              Category: Anticipatory Execution Partner
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight"
          >
            Don&rsquo;t manage time. <br />
            <span className="text-gradient-purple-cyan">Execute it.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed"
          >
            Productivity tools are broken because they assume humans operate like machines. Syntropy is an AI execution partner that predicts when you will fail, negotiates extensions, and completes the first 20% of your work.
          </motion.p>
        </div>

        {/* Google OAuth Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="glass-panel border-gradient-violet glow-violet rounded-3xl p-8 max-w-md w-full space-y-6"
        >
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white tracking-wide">
              Initialize Connection
            </h3>
            <p className="text-xs text-zinc-500">
              Grant Syntropy access to sync calendar nodes, read urgent emails, and run RAG pre-work.
            </p>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl bg-white text-black hover:bg-zinc-100 transition-all font-bold text-xs shadow-lg shadow-white/5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              /* Custom Google logo rendering */
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" width="100%" height="100%">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69c-.29 1.5-.1.14 1.14-2.5 1.77L23.745 12.27z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.86-3c-1.08.72-2.45 1.16-4.1 1.16-3.15 0-5.81-2.13-6.76-5.01L1.27 17.2C3.25 21.19 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.24 14.24a7.15 7.15 0 010-4.48L1.27 6.8a12.02 12.02 0 000 10.39l3.97-2.95z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.81 1.27 6.8l3.97 2.95c.95-2.88 3.61-5 6.76-5z"
                />
              </svg>
            )}
            {loading ? "Connecting to Google..." : "Continue with Google OAuth"}
          </button>

          <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-zinc-500">
            <Key size={12} />
            <span>Least Privilege Sync Protocol Active</span>
          </div>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full pt-10 text-left">
          <div className="glass-panel rounded-2xl p-5 border border-zinc-900 space-y-3">
            <div className="h-8 w-8 rounded-lg bg-[#8b5cf6]/10 flex items-center justify-center text-[#8b5cf6]">
              <Brain size={16} />
            </div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Anticipatory Execution
            </h4>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Reviews upcoming events, searches related email strings, and draft outlines before you sit down.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-5 border border-zinc-900 space-y-3">
            <div className="h-8 w-8 rounded-lg bg-[#06b6d4]/10 flex items-center justify-center text-[#06b6d4]">
              <Clock size={16} />
            </div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Auto-Negotiation
            </h4>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              When workload density hits critical levels, Syntropy drafts extension requests and proposes optimized timeline updates.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-5 border border-zinc-900 space-y-3">
            <div className="h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
              <ShieldAlert size={16} />
            </div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Burnout Mitigation
            </h4>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Integrates Oura recovery metrics and cognitive load projections to actively protect your calendar.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 border-t border-zinc-900/40 flex justify-between items-center text-[10px] font-mono text-zinc-650 z-10">
        <span>© 2026 Syntropy Inc. All Rights Reserved.</span>
        <span>Secure Local Edge Data Shield</span>
      </footer>
    </div>
  );
}
