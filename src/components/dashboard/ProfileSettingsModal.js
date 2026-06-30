"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Sliders, ShieldAlert, Sparkles, Database } from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function ProfileSettingsModal({ isOpen, onClose, user }) {
  const [name, setName] = useState(user?.displayName || "User");
  const [focusHours, setFocusHours] = useState("09:00 AM - 05:00 PM");
  const [stressThreshold, setStressThreshold] = useState(75);
  const [ouraSync, setOuraSync] = useState(true);
  const [recipient, setRecipient] = useState("prof.hargrove@university.edu");
  const [isSaving, setIsSaving] = useState(false);

  // Load profile configurations from Firestore on mount
  useEffect(() => {
    if (!user || user.isMock || !isOpen) return;

    const loadProfile = async () => {
      try {
        const docRef = doc(db, "users", user.uid, "profile", "config");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.name) setName(data.name);
          if (data.focusHours) setFocusHours(data.focusHours);
          if (data.stressThreshold) setStressThreshold(data.stressThreshold);
          if (data.ouraSync !== undefined) setOuraSync(data.ouraSync);
          if (data.recipient) setRecipient(data.recipient);
        }
      } catch (err) {
        console.error("Failed to load profile config from Firestore:", err);
      }
    };

    loadProfile();
  }, [user, isOpen]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const config = {
      name,
      focusHours,
      stressThreshold: Number(stressThreshold),
      ouraSync,
      recipient,
      updatedAt: new Date().toISOString()
    };

    if (user && !user.isMock) {
      try {
        await setDoc(doc(db, "users", user.uid, "profile", "config"), config);
      } catch (err) {
        console.error("Failed to save profile config to Firestore:", err);
      }
    } else {
      // Simulation delay for mock session
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    setIsSaving(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="glass-panel border-gradient-violet glow-violet rounded-3xl w-full max-w-md p-6 relative z-10 space-y-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/40">
              <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                <Sliders size={16} className="text-[#8b5cf6]" />
                Agent Profile & Parameters
              </h3>
              <button 
                onClick={onClose}
                className="p-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="space-y-4">
              {/* User Identity */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-500 uppercase block">User Alias</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-zinc-950 border border-zinc-905 rounded-xl py-2 pl-9 pr-3 text-xs text-zinc-200 focus:outline-none focus:border-[#8b5cf6]/40"
                  />
                  <User size={13} className="text-zinc-650 absolute left-3 top-3" />
                </div>
              </div>

              {/* Working Focus Hours */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-500 uppercase block">Daily Working Hour Slots</label>
                <input 
                  type="text" 
                  value={focusHours}
                  onChange={(e) => setFocusHours(e.target.value)}
                  placeholder="e.g., 09:00 AM - 05:00 PM"
                  required
                  className="w-full bg-zinc-950 border border-zinc-905 rounded-xl py-2 px-3 text-xs text-zinc-200 focus:outline-none focus:border-[#8b5cf6]/40"
                />
              </div>

              {/* Stress Threshold */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase">Stress Alarm Threshold</label>
                  <span className="text-xs font-mono text-[#a78bfa]">{stressThreshold}%</span>
                </div>
                <input 
                  type="range" 
                  min="40"
                  max="95"
                  value={stressThreshold}
                  onChange={(e) => setStressThreshold(e.target.value)}
                  className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-[#8b5cf6]"
                />
              </div>

              {/* Default Recipient */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-500 uppercase block">Default Recipient Email</label>
                <input 
                  type="email" 
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  required
                  className="w-full bg-zinc-950 border border-zinc-905 rounded-xl py-2 px-3 text-xs text-zinc-200 focus:outline-none focus:border-[#8b5cf6]/40"
                />
              </div>

              {/* Toggles */}
              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={ouraSync}
                    onChange={(e) => setOuraSync(e.target.checked)}
                    className="h-3.5 w-3.5 bg-zinc-950 border-zinc-900 text-[#8b5cf6] focus:ring-0 rounded"
                  />
                  <div className="space-y-0.5">
                    <span className="text-xs text-zinc-300 font-semibold block">Enable Oura Sync</span>
                    <p className="text-[9px] text-zinc-500">Automatically adjust calendars based on biometric recovery sleep scores.</p>
                  </div>
                </label>
              </div>

              {/* Save button */}
              <button
                type="submit"
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] text-black font-bold text-xs hover:opacity-90 transition-all mt-6 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Database size={12} className="animate-spin" />
                    Saving Sync...
                  </>
                ) : (
                  <>
                    <Sparkles size={12} />
                    Apply Parameters
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
