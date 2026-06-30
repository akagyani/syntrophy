"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Sparkles, 
  ArrowRight, 
  Check, 
  AlertTriangle, 
  Clock, 
  CalendarClock,
  ExternalLink,
  Trash2,
  Brain
} from "lucide-react";

export default function TaskCard({ task, onStartPrep, onNegotiate, onApproveAction, onDelete, onAddContext }) {
  const getRiskStyles = (risk) => {
    switch (risk) {
      case "critical":
        return {
          border: "border-red-900/30 hover:border-red-500/50",
          badge: "bg-red-500/10 text-red-400 border-red-500/20"
        };
      case "high":
        return {
          border: "border-amber-900/30 hover:border-amber-500/50",
          badge: "bg-amber-500/10 text-amber-400 border-amber-500/20"
        };
      default:
        return {
          border: "border-zinc-800/60 hover:border-zinc-600/80",
          badge: "bg-zinc-800/40 text-zinc-300 border-zinc-700/50"
        };
    }
  };

  const risk = task?.risk || "low";
  const styles = getRiskStyles(risk);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`glass-panel rounded-2xl p-5 mb-5 relative group ${styles.border} transition-all duration-300`}
    >
      {/* Delete button (visible on hover) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (onDelete) onDelete(task.id);
        }}
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute top-4 right-4 text-zinc-500 hover:text-rose-450 p-1.5 rounded-lg hover:bg-rose-500/10 cursor-pointer border border-zinc-900/40 hover:border-rose-500/20 backdrop-blur-md bg-zinc-950/20"
      >
        <Trash2 size={13} />
      </button>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Core Info */}
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${styles.badge}`}>
              {risk.toUpperCase()} RISK
            </span>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              {task?.category || "Work"}
            </span>
            <span className="text-zinc-500 text-xs flex items-center gap-1">
              <Clock size={12} />
              {task?.time || "No slot"}
            </span>
          </div>

          <h3 className="text-base font-bold text-white tracking-wide group-hover:text-[#06b6d4] transition-colors">
            {task?.title || "Untitled commitment"}
          </h3>

          <p className="text-xs text-zinc-400 leading-relaxed">
            {task?.description || "No description provided."}
          </p>

          {task.context && (
            <div className="text-[10px] text-zinc-500 bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-900/60 flex flex-col gap-1">
              <span className="font-mono text-zinc-400 block text-[9px] uppercase tracking-wider">
                TRIGGER EVENT / CONTEXT
              </span>
              <span>{typeof task.context === "object" ? task.context.description || "Complex context attached." : task.context}</span>
            </div>
          )}
        </div>

        {/* AI Action Hub */}
        <div className="flex flex-row md:flex-col items-end gap-3 justify-end min-w-[160px]">
          {task.status === "unprepared" && (
            <div className="flex flex-col gap-2 items-end">
              {onAddContext && (
                <button
                  onClick={() => onAddContext(task)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-semibold bg-[#06b6d4]/5 text-[#06b6d4] border border-[#06b6d4]/20 hover:bg-[#06b6d4]/10 transition-all cursor-pointer"
                >
                  <Brain size={11} />
                  Add Context
                </button>
              )}
              <button
                onClick={() => onStartPrep(task.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#8b5cf6] text-white hover:bg-[#7c3aed] transition-all shadow-md shadow-[#8b5cf6]/20 cursor-pointer"
              >
                <Sparkles size={14} />
                Start for Me
              </button>
            </div>
          )}

          {task.status === "preparing" && (
            <div className="flex items-center gap-2 text-xs font-mono text-[#06b6d4] bg-[#06b6d4]/5 px-3 py-2 rounded-xl border border-[#06b6d4]/10">
              <div className="h-3 w-3 border-2 border-[#06b6d4] border-t-transparent rounded-full animate-spin" />
              <span>AI Executing...</span>
            </div>
          )}

          {task.status === "prepared" && (
            <div className="space-y-2 w-full md:text-right">
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-mono bg-emerald-500/5 px-2.5 py-1 rounded-full border border-emerald-500/10">
                <Check size={12} />
                20% Pre-Work Ready
              </span>
              
              {!task.approved ? (
                <button
                  onClick={() => onApproveAction(task.id)}
                  className="flex items-center gap-2 w-full md:justify-end px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-[#06b6d4]/10 text-[#06b6d4] hover:bg-[#06b6d4]/20 border border-[#06b6d4]/20 transition-all cursor-pointer"
                >
                  {task.aiActionLabel}
                  <ArrowRight size={12} />
                </button>
              ) : (
                <div className="text-[11px] text-zinc-500 font-mono flex items-center gap-1.5 md:justify-end">
                  <Check size={12} className="text-emerald-500" />
                  Approved & Sent to Workspace
                </div>
              )}
            </div>
          )}

          {task.status === "at-risk" && (
            <div className="flex flex-col gap-2 items-end">
              {onAddContext && (
                <button
                  onClick={() => onAddContext(task)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-semibold bg-[#06b6d4]/5 text-[#06b6d4] border border-[#06b6d4]/20 hover:bg-[#06b6d4]/10 transition-all cursor-pointer"
                >
                  <Brain size={11} />
                  Add Context
                </button>
              )}
              <button
                onClick={() => onNegotiate(task.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-red-950/20 text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-all cursor-pointer"
              >
                <CalendarClock size={14} />
                Negotiate Extension
              </button>
            </div>
          )}

          {task.status === "negotiating" && (
            <div className="flex items-center gap-2 text-xs font-mono text-red-400 bg-red-500/5 px-3 py-2 rounded-xl border border-red-500/10">
              <div className="h-3 w-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
              <span>Negotiating time...</span>
            </div>
          )}

          {task.status === "negotiated" && (
            <div className="space-y-2 w-full md:text-right">
              <span className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-mono bg-amber-500/5 px-2.5 py-1 rounded-full border border-amber-500/10">
                <AlertTriangle size={12} />
                Extension Negotiated
              </span>
              
              {!task.approved ? (
                <button
                  onClick={() => onApproveAction(task.id)}
                  className="flex items-center gap-2 w-full md:justify-end px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 transition-all cursor-pointer"
                >
                  Review Proposal
                  <ArrowRight size={12} />
                </button>
              ) : (
                <div className="text-[11px] text-zinc-500 font-mono flex items-center gap-1.5 md:justify-end">
                  <Check size={12} className="text-emerald-500" />
                  Apology Email Sent
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
}
