"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, AlertOctagon, Tag, FileText, Sparkles } from "lucide-react";

export default function AddTaskModal({ isOpen, onClose, onAddTask }) {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [category, setCategory] = useState("Work");
  const [risk, setRisk] = useState("low");
  const [description, setDescription] = useState("");
  const [context, setContext] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !time.trim()) return;

    // Determine action types automatically based on task category and risk levels
    let aiActionType = "summary";
    let aiActionLabel = "View Sync Context";
    let prepTitle = "AI Context Summary";
    let prepContent = "";

    if (category === "Client" || risk === "high") {
      aiActionType = "email";
      aiActionLabel = "Review Draft Email";
      prepTitle = "AI Draft: Client Status Response";
      prepContent = `Subject: Project Update - ${title}\n\nHi team,\n\nHere is the current status report regarding ${title}:\n\n- Completed the core layout structure and animations.\n- Finalizing data model bindings and database tests.\n- We are on schedule to showcase the first iteration during our next call.\n\nBest regards,\nAlex`;
    } else if (category === "Academic" && risk === "critical") {
      aiActionType = "negotiation";
      aiActionLabel = "Negotiate Extension";
      prepTitle = "AI Negotiation Draft: Extension Request";
      prepContent = `To: instructor@university.edu\nSubject: Extension Request: ${title}\n\nDear Instructor,\n\nI am writing to respectfully request a short 24-hour extension on the ${title} due today.\n\nDue to an urgent project release at work, my planned time was severely limited. I want to ensure my submission is of high quality and that I can run final validation tests. \n\nThank you for your consideration.\n\nSincerely,\nAlex`;
    } else {
      prepContent = `Context parsed successfully.\n\n1. Boilerplate modules ready.\n2. Visual effects initialized.\n3. Verified routes compile cleanly.`;
    }

    const newTask = {
      id: `task-${Date.now()}`,
      title,
      time,
      timeRaw: time.split(" ")[0],
      status: "unprepared", // Triggerable start
      risk,
      category,
      description,
      context: context || null,
      prepTitle,
      prepContent,
      aiActionType,
      aiActionLabel,
      approved: false
    };

    onAddTask(newTask);
    
    // Reset Form
    setTitle("");
    setTime("");
    setCategory("Work");
    setRisk("low");
    setDescription("");
    setContext("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="glass-panel border-gradient-violet glow-violet rounded-3xl w-full max-w-lg p-6 relative z-10 space-y-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/40">
              <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                <Sparkles size={16} className="text-[#8b5cf6]" />
                Schedule Commitment Node
              </h3>
              <button 
                onClick={onClose}
                className="p-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-500 uppercase block">Task Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Codebase Integration Tests"
                  required
                  className="w-full bg-zinc-950 border border-zinc-905 rounded-xl py-2 px-3 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-[#8b5cf6]/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase block">Due Time / Slot</label>
                  <input 
                    type="text" 
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="e.g., 2:30 PM - 3:00 PM"
                    required
                    className="w-full bg-zinc-950 border border-zinc-905 rounded-xl py-2 px-3 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-[#8b5cf6]/40"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase block">Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-905 rounded-xl py-2 px-3 text-xs text-zinc-200 focus:outline-none focus:border-[#8b5cf6]/40"
                  >
                    <option value="Work">Work</option>
                    <option value="Client">Client</option>
                    <option value="Academic">Academic</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase block">Risk Alert Priority</label>
                  <select 
                    value={risk}
                    onChange={(e) => setRisk(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-905 rounded-xl py-2 px-3 text-xs text-zinc-200 focus:outline-none focus:border-[#8b5cf6]/40"
                  >
                    <option value="low">Low Risk</option>
                    <option value="high">High Risk</option>
                    <option value="critical">Critical Risk</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-500 uppercase block">Task Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What needs to be done?"
                  rows={2}
                  className="w-full bg-zinc-950 border border-zinc-905 rounded-xl py-2 px-3 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-[#8b5cf6]/40 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-500 uppercase block">Trigger Context (Emails, Commit messages)</label>
                <textarea 
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="e.g., Email string, Github issue context link..."
                  rows={2}
                  className="w-full bg-zinc-950 border border-zinc-905 rounded-xl py-2 px-3 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-[#8b5cf6]/40 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] text-black font-bold text-xs hover:opacity-90 transition-opacity mt-6 cursor-pointer"
              >
                Add Node to Timeline
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
