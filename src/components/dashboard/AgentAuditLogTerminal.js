"use client";

import React, { useState, useEffect } from "react";
import { Terminal, ShieldAlert } from "lucide-react";

const defaultLogs = [
  "[09:00:01] [Orchestrator] Connecting to Google Calendar APIs...",
  "[09:00:04] [Memory RAG] Ingesting user schedule for burnout analysis",
  "[09:00:08] [Orchestrator] High density block detected Thursday afternoon.",
  "[09:00:12] [Negotiation] Drafted 2 emails for negotiation. Pending approval."
];

export default function AgentAuditLogTerminal() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Stream logs one by one for typing effect
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < defaultLogs.length) {
        const nextLog = defaultLogs[idx];
        setLogs((prev) => [...prev, nextLog]);
        idx++;
      } else {
        clearInterval(interval);
      }
    }, 700);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel rounded-2xl p-5 border border-zinc-800/60 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
            <Terminal size={16} className="text-[#8b5cf6]" />
            Agent Audit Log Terminal
          </h3>
          <span className="text-[10px] font-mono text-[#8b5cf6] flex items-center gap-1 uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-[#8b5cf6] animate-ping" />
            Live Feed
          </span>
        </div>

        {/* Terminal frame */}
        <div className="bg-black/80 rounded-xl border border-zinc-800/80 overflow-hidden">
          {/* Header dots */}
          <div className="bg-zinc-900 px-3 py-1.5 flex items-center gap-1.5 border-b border-zinc-800/50">
            <div className="h-2 w-2 rounded-full bg-rose-500/80" />
            <div className="h-2 w-2 rounded-full bg-amber-500/80" />
            <div className="h-2 w-2 rounded-full bg-emerald-500/80" />
            <span className="text-[9px] font-mono text-zinc-650 ml-2">syntropy-orchestrator@edge</span>
          </div>

          {/* Logs scroll console */}
          <div className="p-3.5 h-64 overflow-y-auto font-mono text-[10px] text-zinc-400 space-y-1.5 leading-relaxed">
            {logs.map((log, i) => {
              if (!log) return null;
              // Color code components
              const isOrchestrator = log.includes("Orchestrator");
              const isRAG = log.includes("Memory RAG");
              const isNegotiation = log.includes("Negotiation");
              
              let colorClass = "text-zinc-400";
              if (isOrchestrator) colorClass = "text-zinc-200";
              else if (isRAG) colorClass = "text-[#06b6d4]";
              else if (isNegotiation) colorClass = "text-[#a78bfa]";

              return (
                <div key={i} className={`font-mono ${colorClass}`}>
                  {log}
                </div>
              );
            })}
            
            {/* Blinking cursor */}
            <div className="flex items-center gap-1 font-mono text-[10px] text-zinc-500">
              <span>$ monitoring background agents...</span>
              <span className="inline-block w-1.5 h-3.5 bg-[#8b5cf6] animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
