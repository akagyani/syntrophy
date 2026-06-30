"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Plus, Trash2, User, Mail, Briefcase, Tags, Percent, Clock, AlertTriangle, ChevronDown } from "lucide-react";

const TONE_OPTIONS = [
  { value: "formal", label: "Formal", desc: "Professional & polished" },
  { value: "formal-apologetic", label: "Apologetic", desc: "Genuine remorse + formal" },
  { value: "direct", label: "Direct", desc: "Brief & confident" },
  { value: "friendly", label: "Friendly", desc: "Warm & collegial" }
];

const RELATIONSHIP_OPTIONS = [
  { value: "formal-authority", label: "Authority (Prof / Manager)" },
  { value: "client", label: "Client" },
  { value: "peer", label: "Peer / Colleague" },
  { value: "manager", label: "Direct Manager" }
];

/**
 * ContextCaptureModal
 * Collects rich task + recipient context used by the AI email draft engine.
 *
 * Props:
 *   task         — the task object to enrich
 *   isOpen       — boolean
 *   onClose      — () => void
 *   onSave       — (enrichedTask, recipient, tone) => void
 *   savedRecipients — array of previously saved recipient objects
 */
export default function ContextCaptureModal({ task, isOpen, onClose, onSave, savedRecipients = [] }) {
  // --- Task context state ---
  const [description, setDescription] = useState("");
  const [blockers, setBlockers] = useState([""]);
  const [percentComplete, setPercentComplete] = useState(0);
  const [requestedExtensionDays, setRequestedExtensionDays] = useState(2);

  // --- Recipient state ---
  const [useExisting, setUseExisting] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientRole, setRecipientRole] = useState("");
  const [relationship, setRelationship] = useState("formal-authority");

  // --- Draft config ---
  const [tone, setTone] = useState("formal");
  const [wordLimit, setWordLimit] = useState(180);

  // Pre-fill from task defaults
  useEffect(() => {
    if (!task) return;
    setDescription(task.context?.description || task.description || "");
    setBlockers(task.context?.blockers?.length ? task.context.blockers : [""]);
    setPercentComplete(task.context?.percentComplete ?? 0);
    setRequestedExtensionDays(task.context?.requestedExtensionDays ?? 2);

    // Auto-fill recipient from task category
    if (task.category === "Academic") {
      setRecipientRole("Course Instructor");
      setRelationship("formal-authority");
      setTone("formal-apologetic");
    } else if (task.category === "Client") {
      setRecipientRole("Client Lead");
      setRelationship("client");
      setTone("formal");
    }
  }, [task]);

  if (!isOpen || !task) return null;

  // ── Blockers helpers ──
  const addBlocker = () => setBlockers(b => [...b, ""]);
  const updateBlocker = (i, v) => setBlockers(b => b.map((x, idx) => idx === i ? v : x));
  const removeBlocker = (i) => setBlockers(b => b.filter((_, idx) => idx !== i));

  // ── Select existing recipient ──
  const handleSelectExisting = (r) => {
    setSelectedRecipient(r);
    setRecipientName(r.name);
    setRecipientEmail(r.email);
    setRecipientRole(r.role);
    setRelationship(r.relationship || "formal-authority");
  };

  // ── Compute context score ──
  const filledCount = [
    description.trim(),
    blockers.filter(b => b.trim()).length > 0,
    percentComplete > 0,
    recipientName.trim(),
    recipientEmail.trim(),
    recipientRole.trim()
  ].filter(Boolean).length;
  const contextScore = Math.round((filledCount / 6) * 100);

  const scoreColor = contextScore >= 80 ? "text-emerald-400" : contextScore >= 50 ? "text-amber-400" : "text-rose-400";
  const scoreBarColor = contextScore >= 80 ? "bg-emerald-500" : contextScore >= 50 ? "bg-amber-500" : "bg-rose-500";

  // ── Save ──
  const handleSave = () => {
    const enrichedContext = {
      description,
      blockers: blockers.filter(b => b.trim()),
      percentComplete,
      requestedExtensionDays,
      recipientEmail
    };

    const recipient = useExisting && selectedRecipient
      ? selectedRecipient
      : { name: recipientName, email: recipientEmail, role: recipientRole, relationship };

    const enrichedTask = {
      ...task,
      context: { ...(task.context || {}), ...enrichedContext }
    };

    onSave(enrichedTask, recipient, tone, wordLimit);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 20 }}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0c0c0e] border border-zinc-800/60 rounded-3xl shadow-2xl"
          >
            {/* ── Header ── */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-zinc-800/40 bg-[#0c0c0e]/95 backdrop-blur-sm">
              <div className="flex items-center gap-2.5">
                <Sparkles size={18} className="text-[#8b5cf6]" />
                <div>
                  <h2 className="text-sm font-bold text-white">AI Context Capture</h2>
                  <p className="text-[10px] text-zinc-500 font-mono truncate max-w-[280px]">{task.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Context Score Pill */}
                <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1">
                  <span className="text-[9px] text-zinc-500 font-mono">CONTEXT</span>
                  <span className={`text-[11px] font-bold font-mono ${scoreColor}`}>{contextScore}%</span>
                </div>
                <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">

              {/* ── Context Score Bar ── */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                  <span>CONTEXT COMPLETENESS — feeds directly into AI draft quality</span>
                  <span className={scoreColor}>{contextScore}%</span>
                </div>
                <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${contextScore}%` }}
                    transition={{ duration: 0.4 }}
                    className={`h-full rounded-full ${scoreBarColor}`}
                  />
                </div>
                {contextScore < 60 && (
                  <p className="text-[9px] text-amber-500/80 flex items-center gap-1">
                    <AlertTriangle size={9} /> Fill in more fields for a better AI-generated draft
                  </p>
                )}
              </div>

              {/* ── Task Description ── */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Tags size={10} /> Task Description
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe what this task involves, what you need to communicate, and any relevant background..."
                  rows={3}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-[#8b5cf6]/40 resize-none"
                />
              </div>

              {/* ── Blockers ── */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle size={10} /> Blockers / Reasons
                  <span className="text-zinc-600">(What caused the issue?)</span>
                </label>
                <div className="space-y-2">
                  {blockers.map((b, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        value={b}
                        onChange={e => updateBlocker(i, e.target.value)}
                        placeholder={`Blocker ${i + 1} — e.g. "Hospital visit June 28"`}
                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-[#8b5cf6]/40"
                      />
                      {blockers.length > 1 && (
                        <button onClick={() => removeBlocker(i)} className="text-zinc-600 hover:text-rose-400 transition-colors cursor-pointer">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addBlocker}
                    className="flex items-center gap-1.5 text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer font-mono"
                  >
                    <Plus size={11} /> Add another blocker
                  </button>
                </div>
              </div>

              {/* ── Progress + Extension Days ── */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Percent size={10} /> % Complete
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range" min={0} max={100} step={5}
                      value={percentComplete}
                      onChange={e => setPercentComplete(Number(e.target.value))}
                      className="flex-1 accent-[#8b5cf6]"
                    />
                    <span className="text-xs font-bold text-[#8b5cf6] w-10 text-right font-mono">{percentComplete}%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock size={10} /> Extension Requested
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number" min={1} max={14}
                      value={requestedExtensionDays}
                      onChange={e => setRequestedExtensionDays(Number(e.target.value))}
                      className="w-16 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-[#8b5cf6]/40 text-center"
                    />
                    <span className="text-xs text-zinc-500">days from deadline</span>
                  </div>
                </div>
              </div>

              {/* ── Recipient Section ── */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <User size={10} /> Recipient
                  </label>
                  {savedRecipients.length > 0 && (
                    <button
                      onClick={() => setUseExisting(v => !v)}
                      className="text-[10px] text-[#06b6d4] font-mono hover:underline cursor-pointer"
                    >
                      {useExisting ? "Enter manually" : `Use saved (${savedRecipients.length})`}
                    </button>
                  )}
                </div>

                {useExisting && savedRecipients.length > 0 ? (
                  <div className="grid gap-2">
                    {savedRecipients.map((r, i) => (
                      <button
                        key={i}
                        onClick={() => handleSelectExisting(r)}
                        className={`text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                          selectedRecipient?.email === r.email
                            ? "border-[#8b5cf6]/50 bg-[#8b5cf6]/5 text-white"
                            : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700"
                        }`}
                      >
                        <span className="font-bold block">{r.name}</span>
                        <span className="text-[10px] font-mono text-zinc-500">{r.role} · {r.email}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono text-zinc-500 flex items-center gap-1"><User size={9} /> Name</label>
                      <input
                        value={recipientName}
                        onChange={e => setRecipientName(e.target.value)}
                        placeholder="Prof. Sarah Malik"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-[#8b5cf6]/40"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono text-zinc-500 flex items-center gap-1"><Mail size={9} /> Email</label>
                      <input
                        type="email"
                        value={recipientEmail}
                        onChange={e => setRecipientEmail(e.target.value)}
                        placeholder="s.malik@university.edu"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-[#8b5cf6]/40"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono text-zinc-500 flex items-center gap-1"><Briefcase size={9} /> Role</label>
                      <input
                        value={recipientRole}
                        onChange={e => setRecipientRole(e.target.value)}
                        placeholder="Course Instructor"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-[#8b5cf6]/40"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono text-zinc-500">Relationship</label>
                      <select
                        value={relationship}
                        onChange={e => setRelationship(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-[#8b5cf6]/40 cursor-pointer"
                      >
                        {RELATIONSHIP_OPTIONS.map(o => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Tone Selector ── */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Email Tone</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TONE_OPTIONS.map(t => (
                    <button
                      key={t.value}
                      onClick={() => setTone(t.value)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        tone === t.value
                          ? "border-[#8b5cf6]/60 bg-[#8b5cf6]/10 text-white"
                          : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700"
                      }`}
                    >
                      <span className="text-[11px] font-bold block">{t.label}</span>
                      <span className="text-[9px] text-zinc-500 block mt-0.5">{t.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Word Limit ── */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                  <label>Word Limit</label>
                  <span className="text-zinc-300">{wordLimit} words</span>
                </div>
                <input
                  type="range" min={80} max={400} step={20}
                  value={wordLimit}
                  onChange={e => setWordLimit(Number(e.target.value))}
                  className="w-full accent-[#06b6d4]"
                />
                <div className="flex justify-between text-[9px] text-zinc-600 font-mono">
                  <span>80 (Very brief)</span>
                  <span>400 (Detailed)</span>
                </div>
              </div>

            </div>

            {/* ── Footer ── */}
            <div className="sticky bottom-0 flex justify-end gap-3 p-6 border-t border-zinc-800/40 bg-[#0c0c0e]/95 backdrop-blur-sm">
              <button onClick={onClose} className="px-5 py-2.5 text-xs text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-600 rounded-xl transition-colors cursor-pointer">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={contextScore < 25}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] text-black rounded-xl hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Sparkles size={12} />
                Generate AI Draft — {contextScore}% context
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
