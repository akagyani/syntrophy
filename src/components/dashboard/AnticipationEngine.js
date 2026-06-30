"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Terminal, Check, Send, RefreshCw, ExternalLink, Mail, FileText, Zap, AlertTriangle } from "lucide-react";
import { simulateAILatency, clientCallPrepSteps, streamText } from "../../lib/aiEngine";
import { generateEmailDraft, getContextScore } from "../../lib/emailDraftEngine";

const TONE_OPTIONS = ["formal", "direct", "friendly", "apologetic"];

export default function AnticipationEngine({ activeTask, onCompletePrep, onCompleteNegotiation, contextRecipient, user }) {
  const [currentStep, setCurrentStep] = useState(activeTask?.approved ? clientCallPrepSteps.length - 1 : 0);
  const [isProcessing, setIsProcessing] = useState(!activeTask?.approved);
  const [draftContent, setDraftContent] = useState(activeTask?.approved ? activeTask.prepContent : "");
  const [isDocSynced, setIsDocSynced] = useState(!!activeTask?.docUrl);
  const [isGmailSynced, setIsGmailSynced] = useState(!!activeTask?.gmailDraftId);
  const [isActionActive, setIsActionActive] = useState(false);
  const [tone, setTone] = useState("formal");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [generationSource, setGenerationSource] = useState(null); // "gemini" | "mock" | null

  const defaultEmail = activeTask?.category === "Academic"
    ? "prof.hargrove@university.edu"
    : "client.lead@syntropy-demo.com";
  const [recipientEmail, setRecipientEmail] = useState(contextRecipient?.email || defaultEmail);

  // Recompute recipient email when context changes
  useEffect(() => {
    if (contextRecipient?.email) setRecipientEmail(contextRecipient.email);
  }, [contextRecipient]);

  // Compute context completeness score
  const contextScore = getContextScore(activeTask, contextRecipient);

  useEffect(() => {
    if (!activeTask || activeTask.approved) return;
    let active = true;
    let stepIndex = 0;

    const processSteps = async () => {
      for (let step of clientCallPrepSteps) {
        if (!active) return;
        setCurrentStep(stepIndex);
        await simulateAILatency(800);
        stepIndex++;
      }
      if (!active) return;
      setIsProcessing(false);

      // After steps: try Gemini draft if context is rich enough, else stream static content
      if (contextScore >= 50 && contextRecipient) {
        await runGeminiDraft(true);
      } else {
        await streamText(activeTask.prepContent, (val) => {
          if (active) setDraftContent(val);
        }, 10);
      }
    };

    processSteps();
    return () => { active = false; };
  }, [activeTask]);

  // Call Gemini via API route
  const runGeminiDraft = async (isSilent = false) => {
    if (!isSilent) setIsRegenerating(true);
    try {
      const draft = await generateEmailDraft({
        task: activeTask,
        recipient: contextRecipient || { email: recipientEmail },
        user,
        tone,
        wordLimit: 180
      });
      setDraftContent(draft);
      setGenerationSource("gemini");
    } catch (err) {
      // Fallback to static content on error
      setDraftContent(activeTask.prepContent);
      setGenerationSource("mock");
      console.warn("Gemini draft failed, using static content:", err.message);
    } finally {
      if (!isSilent) setIsRegenerating(false);
    }
  };

  const handleSaveToDoc = async () => {
    setIsActionActive(true);
    try {
      if (onCompletePrep) await onCompletePrep(activeTask.id);
      setIsDocSynced(true);
    } catch (err) {
      console.error("Docs sync failed", err);
    } finally {
      setIsActionActive(false);
    }
  };

  const handleSendEmail = async () => {
    setIsActionActive(true);
    try {
      if (onCompleteNegotiation) await onCompleteNegotiation(activeTask.id, recipientEmail);
      setIsGmailSynced(true);
    } catch (err) {
      console.error("Gmail sync failed", err);
    } finally {
      setIsActionActive(false);
    }
  };

  if (!activeTask) {
    return (
      <div className="glass-panel rounded-2xl p-6 border border-zinc-800/60 h-full flex flex-col items-center justify-center text-center">
        <Sparkles size={32} className="text-zinc-700 mb-3 animate-pulse" />
        <h4 className="text-sm font-semibold text-zinc-500">Execution Hub Idle</h4>
        <p className="text-xs text-zinc-500 max-w-xs mt-1">
          Click &ldquo;Start for Me&rdquo; on any task to trigger Anticipatory Execution pre-work.
        </p>
      </div>
    );
  }

  const isApproved = activeTask.approved || isDocSynced || isGmailSynced;

  return (
    <div className="glass-panel rounded-2xl p-6 border-gradient-cyan glow-cyan h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/40 mb-4">
          <div className="flex items-center gap-2">
            <Terminal size={16} className="text-[#06b6d4]" />
            <h3 className="text-sm font-bold text-white tracking-wide">Anticipatory Execution Engine</h3>
          </div>
          <div className="flex items-center gap-2">
            {/* Context Score Badge */}
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-mono font-bold ${
              contextScore >= 80 ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
              : contextScore >= 50 ? "border-amber-500/30 bg-amber-500/5 text-amber-400"
              : "border-zinc-700 bg-zinc-900 text-zinc-500"
            }`}>
              <Sparkles size={8} />
              {contextScore}% ctx
            </div>
            <span className="text-[9px] font-mono text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-900">
              {activeTask.id}
            </span>
          </div>
        </div>

        {/* Context hint */}
        {contextScore < 50 && !isApproved && (
          <div className="mb-3 p-2 rounded-lg bg-amber-500/5 border border-amber-500/15 flex items-center gap-2 text-[10px] text-amber-400/80">
            <AlertTriangle size={10} className="shrink-0" />
            Low context ({contextScore}%) — using static draft. Add context for a Gemini-powered draft.
          </div>
        )}
        {contextScore >= 50 && generationSource === "gemini" && (
          <div className="mb-3 p-2 rounded-lg bg-[#8b5cf6]/5 border border-[#8b5cf6]/15 flex items-center gap-2 text-[10px] text-[#a78bfa]">
            <Zap size={10} className="shrink-0" />
            Gemini-generated draft — {contextScore}% context fed to AI
          </div>
        )}

        {/* AI Agent Step Tracker */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 uppercase">
            <span>Agent Orchestration</span>
            <span>{currentStep + 1} / {clientCallPrepSteps.length}</span>
          </div>
          <div className="p-3 bg-zinc-950/60 border border-zinc-900/60 rounded-xl space-y-1.5 min-h-[90px]">
            {clientCallPrepSteps.map((step, idx) => {
              const isActive = idx === currentStep && isProcessing;
              const isCompleted = idx < currentStep || (!isProcessing && idx === clientCallPrepSteps.length - 1);
              return (
                <div key={idx} className="flex items-center gap-2.5 text-[11px] font-mono">
                  {isActive ? (
                    <RefreshCw size={12} className="text-[#06b6d4] animate-spin shrink-0" />
                  ) : isCompleted ? (
                    <Check size={12} className="text-emerald-500 shrink-0" />
                  ) : (
                    <div className="h-1.5 w-1.5 rounded-full bg-zinc-800 shrink-0 ml-1" />
                  )}
                  <span className={isActive ? "text-[#06b6d4]" : isCompleted ? "text-zinc-400" : "text-zinc-600"}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Draft Content Pane */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              {activeTask.prepTitle}
            </span>
            {/* Regenerate with Gemini */}
            {!isProcessing && !isApproved && (
              <button
                onClick={() => runGeminiDraft(false)}
                disabled={isRegenerating}
                className="flex items-center gap-1 text-[9px] font-mono text-[#8b5cf6] hover:text-[#a78bfa] transition-colors cursor-pointer disabled:opacity-50"
              >
                <Zap size={9} />
                {isRegenerating ? "Generating..." : "Re-generate with AI"}
              </button>
            )}
          </div>

          <div className="h-44 bg-[#050505] border border-[#222] shadow-[inset_0_2px_15px_rgba(0,0,0,0.8)] rounded-lg p-4 overflow-y-auto font-mono text-[11px] leading-relaxed text-[#a1a1aa]">
            {isRegenerating ? (
              <div className="h-full flex items-center justify-center text-[#555] font-sans gap-2 text-xs">
                <Sparkles size={14} className="animate-pulse text-[#8b5cf6]" />
                <span>Gemini composing draft with {contextScore}% context...</span>
              </div>
            ) : draftContent ? (
              <pre className="whitespace-pre-wrap font-mono text-[#d4d4d8] leading-relaxed">{draftContent}</pre>
            ) : (
              <div className="h-full flex items-center justify-center text-[#555] font-sans gap-2 text-xs">
                <Sparkles size={14} className="animate-pulse text-[#8b5cf6]" />
                <span>AI Reasoner computing contextual vectors...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recipient + Tone + Actions */}
      <div className="pt-4 mt-4 border-t border-zinc-800/40 space-y-4">

        {!isApproved && (
          <>
            {/* Tone Selector */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-mono text-zinc-500 uppercase">Tone</label>
              <div className="flex gap-1.5">
                {TONE_OPTIONS.map(t => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-mono capitalize transition-all cursor-pointer border ${
                      tone === t
                        ? "border-[#8b5cf6]/50 bg-[#8b5cf6]/10 text-[#a78bfa]"
                        : "border-zinc-800 text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient Email */}
            <div className="space-y-1">
              <label className="text-[9px] font-mono text-zinc-500 uppercase block">Recipient Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  disabled={isProcessing || !draftContent}
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-xl py-1.5 pl-8 pr-3 text-[11px] text-zinc-200 focus:outline-none focus:border-[#06b6d4]/40 disabled:opacity-50"
                />
                <Mail size={12} className="text-zinc-650 absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleSaveToDoc}
                disabled={isProcessing || isActionActive || !draftContent}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                  isProcessing || isActionActive || !draftContent
                    ? "bg-zinc-900 text-zinc-600 border border-zinc-800/40 cursor-not-allowed"
                    : "bg-zinc-900 border border-zinc-850 hover:border-zinc-700 text-white"
                }`}
              >
                <FileText size={12} className="text-[#06b6d4]" />
                Save in Doc
              </button>
              <button
                onClick={handleSendEmail}
                disabled={isProcessing || isActionActive || !draftContent}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                  isProcessing || isActionActive || !draftContent
                    ? "bg-zinc-900 text-zinc-600 border border-zinc-800/40 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] text-black hover:opacity-90 font-bold"
                }`}
              >
                <Send size={12} />
                Send via Email
              </button>
            </div>
          </>
        )}

        {isApproved && (
          <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-semibold flex flex-col items-center justify-center gap-2 text-center w-full">
            <div className="flex items-center gap-2">
              <Check size={14} />
              Commitment processed &amp; workspace updated
            </div>
            {(activeTask.docUrl || isDocSynced) && (
              <a href={activeTask.docUrl || "https://docs.google.com"} target="_blank" rel="noreferrer"
                className="text-[#06b6d4] hover:text-[#0891b2] font-bold flex items-center gap-1 mt-1 text-[11px] underline">
                Open Google Doc <ExternalLink size={10} />
              </a>
            )}
            {(activeTask.gmailDraftId || isGmailSynced) && (
              <span className="text-[10px] text-zinc-400 font-mono mt-0.5">
                Gmail Draft Saved (ID: {(activeTask.gmailDraftId || "Composition Pending").substring(0, 12)}...)
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
