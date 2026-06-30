"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Square, Sparkles, Check, X, Volume2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
const defaultMorningBriefing = {
  summary: "Your schedule today is extremely dense. I've automatically drafted an extension request for the CS401 project and set up your pre-work for the 3 PM Client Call.",
  actions: [
    { id: "act-1", label: "Approve CS401 Extension Draft", status: "pending" },
    { id: "act-2", label: "Review 3PM Client Briefing", status: "pending" }
  ]
};

export default function MorningBriefing({ onApproveBriefingAction }) {
  const { user } = useAuth();
  const userName = user?.displayName?.split(" ")[0] || "User";
  const greeting = `Good Morning, ${userName}.`;

  const [isPlaying, setIsPlaying] = useState(false);
  const [briefingText, setBriefingText] = useState("");
  const [actionStates, setActionStates] = useState(
    defaultMorningBriefing.actions.reduce((acc, act) => {
      acc[act.id] = act.status;
      return acc;
    }, {})
  );

  // Ensure speech is cancelled if the component unmounts
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleTogglePlay = () => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);

    if (typeof window !== "undefined" && window.speechSynthesis) {
      if (!nextState) {
        setBriefingText("");
        window.speechSynthesis.cancel();
      } else {
        const textToSpeak = `${greeting} ${defaultMorningBriefing.summary}`;
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        
        // Try to pick a natural-sounding English voice if available
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          const preferredVoice = 
            voices.find(v => (v.name.includes("Google") || v.name.includes("Samantha") || v.name.includes("Natural")) && v.lang.startsWith("en")) || 
            voices.find(v => v.lang.startsWith("en")) || 
            voices[0];
          if (preferredVoice) utterance.voice = preferredVoice;
        }

        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.onend = () => {
          setIsPlaying(false);
        };

        window.speechSynthesis.speak(utterance);
      }
    } else if (!nextState) {
      setBriefingText("");
    }
  };

  // Typewriter effect when playing
  useEffect(() => {
    if (!isPlaying) return;

    let current = "";
    let index = 0;
    const fullText = `${greeting} ${defaultMorningBriefing.summary}`;
    
    const interval = setInterval(() => {
      if (index < fullText.length) {
        current += fullText[index];
        setBriefingText(current);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 15);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleAction = (id, approved) => {
    setActionStates((prev) => ({
      ...prev,
      [id]: approved ? "approved" : "dismissed"
    }));
    if (onApproveBriefingAction) {
      onApproveBriefingAction(id, approved);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border-gradient-violet glow-violet relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 right-0 h-40 w-40 bg-[radial-gradient(circle,rgba(139,92,246,0.06)_0%,transparent_70%)] blur-[40px] pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <Sparkles size={18} className="text-[#8b5cf6] animate-pulse" />
            {defaultMorningBriefing.greeting}
          </h2>
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mt-0.5">
            Gemini Audio Briefing Agent
          </span>
        </div>

        {/* Audio Player Buttons & Visualizer */}
        <div className="flex items-center gap-4">
          {isPlaying && (
            <div className="flex items-center gap-1 h-6">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: [6, 20, 6],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: "easeInOut",
                  }}
                  className="w-[3px] bg-[#8b5cf6] rounded-full"
                />
              ))}
            </div>
          )}

          <button
            onClick={handleTogglePlay}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              isPlaying
                ? "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                : "bg-[#8b5cf6] text-white hover:bg-[#7c3aed] shadow-md shadow-[#8b5cf6]/20"
            }`}
          >
            {isPlaying ? (
              <>
                <Square size={12} fill="currentColor" /> Stop Briefing
              </>
            ) : (
              <>
                <Play size={12} fill="currentColor" /> Listen Briefing
              </>
            )}
          </button>
        </div>
      </div>

      {/* Briefing text display */}
      <div className="min-h-16 mb-6">
        {isPlaying ? (
          <p className="text-xs text-zinc-200 leading-relaxed font-sans">
            {briefingText}
            <span className="inline-block w-1.5 h-3 bg-[#8b5cf6] ml-1 animate-pulse" />
          </p>
        ) : (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-zinc-950/40 border border-zinc-900/60 text-zinc-400 text-xs">
            <Volume2 size={18} className="text-zinc-500 shrink-0" />
            <span>Click &ldquo;Listen Briefing&rdquo; to start the Gemini Voice Agent briefing on your daily load and automated schedule changes.</span>
          </div>
        )}
      </div>

      {/* Quick Action Proposals */}
      {isPlaying && briefingText.length >= defaultMorningBriefing.summary.length / 2 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3 pt-4 border-t border-zinc-800/40"
        >
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
            PENDING PRE-WORK ACTIONS
          </span>

          <div className="space-y-2">
            {defaultMorningBriefing.actions.map((act) => (
              <div
                key={act.id}
                className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-900/60"
              >
                <span className="text-xs text-zinc-300 font-medium">{act.label}</span>

                <div className="flex items-center gap-2">
                  {actionStates[act.id] === "pending" ? (
                    <>
                      <button
                        onClick={() => handleAction(act.id, false)}
                        className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 hover:text-red-400 transition-colors cursor-pointer"
                        title="Dismiss suggestion"
                      >
                        <X size={12} />
                      </button>
                      <button
                        onClick={() => handleAction(act.id, true)}
                        className="p-1.5 rounded-lg bg-[#06b6d4]/10 border border-[#06b6d4]/20 hover:bg-[#06b6d4]/20 text-[#06b6d4] transition-colors cursor-pointer"
                        title="Approve action"
                      >
                        <Check size={12} />
                      </button>
                    </>
                  ) : actionStates[act.id] === "approved" ? (
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                      APPROVED
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 border border-zinc-850 px-2 py-0.5 rounded">
                      DISMISSED
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
