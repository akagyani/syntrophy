"use client";

import React from "react";
import { Cpu, RefreshCw, Zap } from "lucide-react";

const defaultAgentStatus = [
  { name: "Calendar Sync", status: "idle", load: "0%" },
  { name: "Gemini Analysis", status: "active", load: "87%" },
  { name: "Draft Engine", status: "idle", load: "0%" }
];

export default function AgentStatusPanel() {
  return (
    <div className="glass-panel rounded-2xl p-5 border border-zinc-800/60 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
            <Cpu size={16} className="text-[#8b5cf6]" />
            Agent Status Monitor
          </h3>
          <span className="text-[10px] font-mono text-zinc-500 uppercase">
            Active Layers
          </span>
        </div>

        <div className="space-y-3">
          {defaultAgentStatus.map((agent, i) => (
            <div 
              key={i} 
              className="p-3 bg-zinc-950/40 border border-zinc-900/60 rounded-xl flex items-center justify-between gap-3 hover:border-[#8b5cf6]/20 transition-colors"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{agent.name}</span>
                  <span className="text-[9px] font-mono text-zinc-500 px-1.5 bg-zinc-900 border border-zinc-800 rounded">
                    {agent.model}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 leading-relaxed max-w-xs">{agent.desc}</p>
              </div>

              <div className="flex flex-col items-end shrink-0 gap-1">
                <span className={`inline-flex items-center gap-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                  agent.status === "active"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-zinc-800/40 text-zinc-400 border-zinc-700/20"
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${
                    agent.status === "active" ? "bg-emerald-500 animate-pulse" : "bg-zinc-500"
                  }`} />
                  {agent.status}
                </span>
                
                <span className="text-[9px] font-mono text-zinc-500 flex items-center gap-0.5">
                  <Zap size={10} />
                  {agent.latency}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
