"use client";

import React from "react";
import { GitCommit, AlertCircle, ArrowRight } from "lucide-react";

export default function DependencyGraphPanel({ tasks = [] }) {
  const cs401Task = tasks.find(t => t.id === "task-3");
  const isUnblocked = cs401Task?.approved || false;

  const getNodeColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
      case "blocked":
        return "bg-red-500/10 border-red-500/30 text-red-400 animate-pulse";
      default:
        return "bg-indigo-500/10 border-indigo-500/30 text-indigo-400";
    }
  };

  const getConnectorClass = (status) => {
    return status === "completed" ? "bg-emerald-500/40" : "bg-zinc-800";
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-zinc-800/60 h-full flex flex-col justify-between">
      <div>
        <h3 className="text-xs font-bold text-white tracking-wider uppercase font-mono flex items-center gap-2 mb-4">
          <GitCommit size={14} className="text-[#8b5cf6]" />
          Schedule Dependency Graph
        </h3>
        
        <p className="text-[10px] text-zinc-500 mb-5 leading-normal">
          Visualizes how scheduling dependencies flow. Delaying a task linked by arrows impacts everything downstream.
        </p>

        {/* Dynamic Nodes Container */}
        <div className="space-y-4">
          
          {/* Path 1: Core System Flow */}
          <div className="flex flex-col gap-2 p-3 bg-zinc-950/40 border border-zinc-900/60 rounded-xl">
            <span className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">Morning Ingestion Setup</span>
            
            <div className="flex items-center gap-2">
              <div className="px-2.5 py-1 rounded text-[10.5px] font-bold border bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-mono">
                Sleep Data Ingest
              </div>
              <ArrowRight size={12} className="text-zinc-600" />
              <div className="px-2.5 py-1 rounded text-[10.5px] font-bold border bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-mono">
                Workload Audit
              </div>
            </div>
          </div>

          {/* Path 2: Rescheduling Flow */}
          <div className="flex flex-col gap-2 p-3 bg-zinc-950/40 border border-zinc-900/60 rounded-xl">
            <span className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">Sarah 1:1 Rescheduling</span>
            
            <div className="flex items-center gap-2">
              <div className="px-2.5 py-1 rounded text-[10.5px] font-bold border bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-mono">
                Trigger Apology
              </div>
              <ArrowRight size={12} className="text-zinc-600" />
              <div className="px-2.5 py-1 rounded text-[10.5px] font-bold border bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-mono">
                Move Calendar Slot
              </div>
            </div>
          </div>

          {/* Path 3: Client Prep Flow */}
          <div className="flex flex-col gap-2 p-3 bg-zinc-950/40 border border-zinc-900/60 rounded-xl">
            <span className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">3:00 PM Client call pre-work</span>
            
            <div className="flex items-center gap-2">
              <div className="px-2.5 py-1 rounded text-[10.5px] font-bold border bg-indigo-500/10 border-indigo-500/20 text-indigo-400 font-mono">
                Run Ingest Agent
              </div>
              <ArrowRight size={12} className="text-zinc-600" />
              <div className="px-2.5 py-1 rounded text-[10.5px] font-bold border bg-zinc-900 border-zinc-800 text-zinc-500 font-mono">
                Client Call Demo
              </div>
            </div>
          </div>

          {/* Path 4: Assignment Negotiation (BLOCKED PATH) */}
          <div className={`flex flex-col gap-2 p-3 rounded-xl transition-all duration-300 ${
            isUnblocked 
              ? "bg-emerald-950/5 border border-emerald-500/15" 
              : "bg-red-950/5 border border-red-900/10"
          }`}>
            <span className={`text-[9px] font-mono font-bold uppercase block mb-1 flex items-center gap-1 ${
              isUnblocked ? "text-emerald-450" : "text-red-400"
            }`}>
              <AlertCircle size={10} className={isUnblocked ? "text-emerald-450" : "text-red-400"} />
              {isUnblocked ? "Path Cleared: Extension Active" : "Blocked Path: Submission Delay"}
            </span>
            
            <div className="flex items-center gap-2">
              <div className={`px-2.5 py-1 rounded text-[10.5px] font-bold border font-mono ${
                isUnblocked 
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                  : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
              }`}>
                Draft Extension Email
              </div>
              <ArrowRight size={12} className={isUnblocked ? "text-emerald-500/40" : "text-red-500/40"} />
              <div className={`px-2.5 py-1 rounded text-[10.5px] font-bold border font-mono ${
                isUnblocked 
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                  : "bg-red-500/10 border-red-500/20 text-red-400 animate-pulse"
              }`}>
                {isUnblocked ? "Rescheduled Submission" : "Blocked Submission Task"}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
