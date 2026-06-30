"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import Header from "../../../components/layout/Header";
import { ShieldAlert, Sparkles, Brain, Clock, ShieldCheck, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { db } from "../../../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import ReportExportButton from "../../../components/dashboard/ReportExportButton";

export default function BurnoutRadarPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState([]);

  // Redirect Guard
  useEffect(() => {
    if (!user && !loading) {
      router.push("/");
    }
  }, [user, loading, router]);

  // Firestore Real-Time Sync Subscription
  useEffect(() => {
    if (!user) return;

    const tasksRef = collection(db, "users", user.uid, "tasks");
    const unsubscribe = onSnapshot(tasksRef, (snapshot) => {
      const dbTasks = [];
      snapshot.forEach((doc) => {
        dbTasks.push(doc.data());
      });
      if (dbTasks.length > 0) {
        setTasks(dbTasks);
      }
    });

    return () => unsubscribe();
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-zinc-400 font-mono text-xs gap-3 w-full fixed inset-0 z-50">
        <div className="h-4 w-4 border-2 border-[#8b5cf6] border-t-transparent rounded-full animate-spin" />
        <span>Authenticating with Syntropy...</span>
      </div>
    );
  }

  // Calculate stats based on tasks
  const totalTasks = tasks.length;
  const criticalTasks = tasks.filter(t => t.risk === "critical").length;
  const highTasks = tasks.filter(t => t.risk === "high").length;
  const approvedTasks = tasks.filter(t => t.approved).length;
  
  // Stress indexes calculation
  const sleepRecovery = 52;
  const calendarCongestion = totalTasks * 10 + (criticalTasks * 15);
  const burnoutIndex = Math.min(Math.round(((100 - sleepRecovery) * 0.6) + (calendarCongestion * 0.4)), 95);

  const forecastDays = [
    { day: "Mon", load: 65, status: "stable" },
    { day: "Tue", load: 85, status: "high-alert" },
    { day: "Wed", load: 50, status: "stable" },
    { day: "Thu", load: 40, status: "optimal" },
    { day: "Fri", load: 30, status: "optimal" }
  ];

  return (
    <>
      <Header isAIPerforming={false} aiStatusText="" />
      
      <div className="flex-1 p-8 overflow-y-auto w-full space-y-6">
        
        {/* Title Banner */}
        <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/40 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldAlert className="text-rose-400" size={20} />
              Cognitive Load & Burnout Radar
            </h1>
            <p className="text-xs text-zinc-400">
              Predictive models calculating stress indexes based on Oura recovery status and daily timelines.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#06b6d4] bg-[#06b6d4]/5 px-3 py-1.5 rounded-xl border border-[#06b6d4]/10">
            <Sparkles size={12} className="animate-pulse" />
            <span>Stress Predictor: ACTIVE</span>
          </div>
        </div>

        {/* 2-Column Main Analysis View */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Main Metrics (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Core Load Index Card */}
            <div className="glass-panel border border-zinc-800/60 rounded-3xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              
              {/* Dial Chart representation */}
              <div className="flex flex-col items-center justify-center p-4 bg-zinc-950 border border-zinc-900 rounded-2xl relative overflow-hidden h-36">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Burnout Index</span>
                <span className="text-3xl font-bold text-rose-400 font-mono">{burnoutIndex}%</span>
                <span className="text-[9px] font-mono text-rose-500 uppercase tracking-widest mt-1">High Alert</span>
              </div>

              {/* Status details */}
              <div className="md:col-span-2 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Brain size={16} className="text-[#8b5cf6]" />
                  Executive Energy Audit
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Your sleep recovery is low ({sleepRecovery}/100) due to fragmented REM sleep cycles. Combined with {criticalTasks} critical commitments, your cognitive bandwidth will degrade rapidly after 4:00 PM.
                </p>
              </div>

            </div>

            {/* 5-Day Load Forecast Chart */}
            <div className="glass-panel border border-zinc-800/60 rounded-3xl p-6 space-y-4">
              <h3 className="text-xs font-bold text-white font-mono tracking-wider uppercase flex items-center gap-1.5">
                <Clock size={14} className="text-[#06b6d4]" />
                5-Day Stress Congestion Forecast
              </h3>

              <div className="h-44 flex items-end justify-between gap-4 pt-6 pb-2 px-4 bg-zinc-950/40 border border-zinc-900/60 rounded-2xl relative">
                {forecastDays.map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    <span className="text-[9px] font-mono text-zinc-500">{item.load}%</span>
                    <div className="w-full relative rounded-t-md overflow-hidden bg-zinc-900" style={{ height: `${item.load}%`, minHeight: '8px' }}>
                      <div className={`h-full w-full ${
                        item.load > 75 
                          ? "bg-gradient-to-t from-red-600 to-rose-400 shadow-[0_0_10px_rgba(239,68,68,0.4)]"
                          : item.load > 50 
                          ? "bg-gradient-to-t from-amber-600 to-amber-400"
                          : "bg-gradient-to-t from-emerald-600 to-emerald-400"
                      }`} />
                    </div>
                    <span className="text-xs font-bold text-white font-mono">{item.day}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right AI Recommendations Panel (1/3 width) */}
          <div className="space-y-6">
            
            {/* Action Recommendations */}
            <div className="glass-panel border border-zinc-800/60 rounded-3xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-white font-mono tracking-wider uppercase flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-400" />
                Active Recommendations
              </h3>

              <div className="space-y-3">
                
                <div className="p-3 bg-zinc-950/60 border border-zinc-900 rounded-xl space-y-1">
                  <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase">Auto-Negotiated</span>
                  <span className="text-xs font-semibold text-white block">Sarah 1:1 Meeting</span>
                  <p className="text-[10px] text-zinc-500 leading-normal">
                    Pushed to tomorrow 10 AM. Saves 1.5 hours of focus time today.
                  </p>
                </div>

                <div className="p-3 bg-zinc-950/60 border border-zinc-900 rounded-xl space-y-1">
                  <span className="text-[9px] font-mono text-amber-400 font-bold uppercase">Pending Decision</span>
                  <span className="text-xs font-semibold text-white block">CS-401 coding assignment</span>
                  <p className="text-[10px] text-zinc-500 leading-normal">
                    AI recommends requesting a 48-hour extension. Calendar density is high.
                  </p>
                </div>

              </div>
            </div>

            {/* Health Stats */}
            <div className="glass-panel border border-zinc-800/60 rounded-3xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-white font-mono tracking-wider uppercase flex items-center gap-1.5">
                <Heart size={13} className="text-rose-500" />
                Bio-Sensor Status
              </h3>
              
              <div className="divide-y divide-zinc-900 text-xs">
                <div className="py-2 flex justify-between">
                  <span className="text-zinc-500">Sleep Score</span>
                  <span className="text-rose-400 font-mono">52 (Poor)</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-zinc-500">REM Sleep</span>
                  <span className="text-zinc-300 font-mono">48m</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-zinc-500">Sleep Latency</span>
                  <span className="text-zinc-300 font-mono">14m</span>
                </div>
              </div>
            </div>

            {/* PDF Report Export */}
            <div className="glass-panel border border-zinc-800/60 rounded-3xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-white font-mono tracking-wider uppercase flex items-center gap-1.5">
                <Sparkles size={13} className="text-[#8b5cf6]" />
                Export Execution Report
              </h3>
              <p className="text-[10px] text-zinc-500 leading-relaxed">
                Generate a full PDF report with commitment log, burnout timeline, AI negotiation audit, and KPIs.
              </p>
              <ReportExportButton
                user={user}
                tasks={tasks}
                burnoutData={{
                  avgScore: burnoutIndex,
                  timeline: forecastDays.map(d => ({ day: d.day, score: d.load }))
                }}
              />
            </div>

          </div>

        </div>

      </div>
    </>
  );
}
