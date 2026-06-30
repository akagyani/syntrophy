"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import Header from "../../../components/layout/Header";
import AgentStatusPanel from "../../../components/dashboard/AgentStatusPanel";
import DependencyGraphPanel from "../../../components/dashboard/DependencyGraphPanel";
import AgentAuditLogTerminal from "../../../components/dashboard/AgentAuditLogTerminal";
import { db } from "../../../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { BrainCircuit, Sparkles } from "lucide-react";

export default function ExecutionPlanPage() {
  const [tasks, setTasks] = useState([]);
  const { user, loading } = useAuth();
  const router = useRouter();

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

  return (
    <>
      <Header isAIPerforming={false} aiStatusText="" />
      
      <div className="flex-1 p-8 overflow-y-auto w-full space-y-6">
        
        {/* Title Banner */}
        <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/40 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <BrainCircuit className="text-[#8b5cf6]" size={20} />
              Autonomous Execution Planner
            </h1>
            <p className="text-xs text-zinc-400">
              Real-time monitoring of decentralized agent networks, schedule graphs, and execution logs.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#06b6d4] bg-[#06b6d4]/5 px-3 py-1.5 rounded-xl border border-[#06b6d4]/10">
            <Sparkles size={12} className="animate-pulse" />
            <span>Multi-Agent Sync: ACTIVE</span>
          </div>
        </div>

        {/* 3-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Agent Status Panel */}
          <div>
            <AgentStatusPanel />
          </div>

          {/* Dependency Graph Panel */}
          <div>
            <DependencyGraphPanel tasks={tasks} />
          </div>

          {/* Live Terminal Log */}
          <div>
            <AgentAuditLogTerminal />
          </div>
        </div>

      </div>
    </>
  );
}
