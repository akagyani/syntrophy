"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import Header from "../../../components/layout/Header";
import { Mail, Sparkles, Check, Edit2, Shield, FileText, ChevronRight, Sliders } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../../../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function CommsDraftsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [tone, setTone] = useState("Professional");
  const [editorText, setEditorText] = useState("");

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
        if (!selectedTask) {
           setSelectedTask(dbTasks[0]);
           setEditorText(dbTasks[0].prepContent || "");
        }
      }
    });

    return () => unsubscribe();
  }, [user, selectedTask]);

  // Sync selected task content when loaded or selected
  useEffect(() => {
    if (selectedTask) {
      const matched = tasks.find(t => t.id === selectedTask.id);
      if (matched) {
        setEditorText(matched.prepContent);
      }
    }
  }, [selectedTask, tasks]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-zinc-400 font-mono text-xs gap-3 w-full fixed inset-0 z-50">
        <div className="h-4 w-4 border-2 border-[#8b5cf6] border-t-transparent rounded-full animate-spin" />
        <span>Authenticating with Syntropy...</span>
      </div>
    );
  }

  const handleAdjustTone = (selectedTone) => {
    setTone(selectedTone);
    // Simulate LLM rewriting draft under custom tone settings
    let tonePrefix = "";
    if (selectedTone === "Friendly") {
      tonePrefix = "Hi! Just wanted to reach out regarding ";
    } else if (selectedTone === "Direct") {
      tonePrefix = "STATUS REPORT REQUIRED: ";
    } else {
      tonePrefix = "Dear instructor/recipient,\n\nI am writing to formally request updates on ";
    }
    setEditorText(`${tonePrefix}${selectedTask.title}\n\n${selectedTask.prepContent.split("\n\n").slice(1).join("\n\n")}`);
  };

  return (
    <>
      <Header isAIPerforming={false} aiStatusText="" />
      
      <div className="flex-1 p-8 overflow-y-auto w-full space-y-6">
        
        {/* Title Banner */}
        <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/40 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Mail className="text-[#8b5cf6]" size={20} />
              Comms & Drafts Center
            </h1>
            <p className="text-xs text-zinc-400">
              Reviewing AI drafted communications, tweaking message tones, and monitoring Google Doc outlines.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#06b6d4] bg-[#06b6d4]/5 px-3 py-1.5 rounded-xl border border-[#06b6d4]/10">
            <Sparkles size={12} className="animate-pulse" />
            <span>Draft Sync: REAL-TIME</span>
          </div>
        </div>

        {/* 2-Column Mailbox View */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Drafts list (1/3 width) */}
          <div className="glass-panel border border-zinc-800/60 rounded-3xl p-5 space-y-4 h-[550px] overflow-y-auto">
            <h3 className="text-xs font-bold text-white font-mono tracking-wider uppercase">
              Recent Workspace Drafts
            </h3>

            <div className="space-y-2">
              {tasks.map((task, idx) => {
                const isSelected = selectedTask?.id === task.id;
                return (
                  <div
                    key={task.id ?? idx}
                    onClick={() => {
                      setSelectedTask(task);
                      setEditorText(task.prepContent);
                    }}
                    className={`p-3 rounded-xl border text-[11px] font-sans flex items-center justify-between cursor-pointer transition-all duration-200 select-none ${
                      isSelected
                        ? "bg-[#8b5cf6]/10 border-[#8b5cf6]/30 text-white shadow-sm shadow-[#8b5cf6]/5"
                        : "bg-zinc-950/40 border-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-950/60"
                    }`}
                  >
                    <div className="space-y-0.5 max-w-[150px] truncate">
                      <span className="font-semibold block truncate">{task.title}</span>
                      <span className="text-[9px] font-mono opacity-80">{(task.aiActionType ?? "AI").toUpperCase()} DRAFT</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {task.approved ? (
                        <Check size={12} className="text-emerald-500" />
                      ) : (
                        <span className="text-[9px] text-[#8b5cf6] font-mono">PENDING</span>
                      )}
                      <ChevronRight size={10} className="text-zinc-650" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Editor Panel (2/3 width) */}
          <div className="lg:col-span-2 glass-panel border border-zinc-800/60 rounded-3xl p-6 flex flex-col justify-between h-[550px]">
            {selectedTask ? (
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                
                {/* Editor Header */}
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800/40">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">{selectedTask.prepTitle}</span>
                    <h3 className="text-sm font-bold text-white">{selectedTask.title}</h3>
                  </div>
                  
                  {/* Status Indicator */}
                  <span className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded border ${
                    selectedTask.approved
                      ? "border-emerald-500/20 text-emerald-400 bg-emerald-500/10"
                      : "border-indigo-500/20 text-indigo-400 bg-indigo-500/10 animate-pulse"
                  }`}>
                    {selectedTask.approved ? "Workspace Synced" : "Pending Approval"}
                  </span>
                </div>

                {/* Tone Adjuster Slider */}
                {!selectedTask.approved && (
                  <div className="flex items-center gap-4 bg-zinc-950/60 border border-zinc-900/60 p-2.5 rounded-xl text-[10px] font-mono">
                    <span className="text-zinc-500 uppercase flex items-center gap-1">
                      <Sliders size={12} className="text-[#8b5cf6]" /> Adjust Tone:
                    </span>
                    <div className="flex gap-2">
                      {["Professional", "Friendly", "Direct"].map((t) => (
                        <button
                          key={t}
                          onClick={() => handleAdjustTone(t)}
                          className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                            tone === t
                              ? "bg-[#8b5cf6]/20 text-white font-bold border border-[#8b5cf6]/35"
                              : "text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Textarea Editor */}
                <div className="flex-1 my-4 relative">
                  <textarea
                    value={editorText}
                    onChange={(e) => setEditorText(e.target.value)}
                    disabled={selectedTask.approved}
                    className="w-full h-full bg-zinc-950 border border-zinc-900 rounded-xl p-4 font-mono text-[11px] leading-relaxed text-zinc-300 focus:outline-none focus:border-[#8b5cf6]/40 resize-none disabled:opacity-85"
                  />
                  {!selectedTask.approved && (
                    <Edit2 size={12} className="text-zinc-650 absolute right-3 top-3 pointer-events-none" />
                  )}
                </div>

                {/* Save Confirmation */}
                {selectedTask.approved && (
                  <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 text-emerald-450 rounded-xl text-[11px] flex items-center gap-2">
                    <Shield size={12} />
                    Verified & Synced: Changes locked to prevent timeline out-of-sync conflicts.
                  </div>
                )}

              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <Mail size={32} className="text-zinc-700 mb-3 animate-pulse" />
                <h4 className="text-sm font-semibold text-zinc-500">No Draft Selected</h4>
                <p className="text-xs text-zinc-500 max-w-xs mt-1">
                  Select a drafted workspace task on the left panel to review outlines and edit tones.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </>
  );
}
