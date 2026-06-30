"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CalendarClock, Check, RefreshCw, Send, Mail, FileText, ExternalLink } from "lucide-react";
import { simulateAILatency, negotiationSteps, streamText } from "../../lib/aiEngine";

export default function NegotiationPanel({ activeTask, onCompletePrep, onCompleteNegotiation }) {
  const [currentStep, setCurrentStep] = useState(activeTask.approved ? negotiationSteps.length - 1 : 0);
  const [isProcessing, setIsProcessing] = useState(!activeTask.approved);
  const [draftEmail, setDraftEmail] = useState(activeTask.approved ? activeTask.prepContent : "");
  
  const [isDocSynced, setIsDocSynced] = useState(!!activeTask.docUrl);
  const [isGmailSynced, setIsGmailSynced] = useState(!!activeTask.gmailDraftId);
  const [isActionActive, setIsActionActive] = useState(false);

  const defaultEmail = activeTask.category === "Academic" 
    ? "prof.hargrove@university.edu" 
    : "client.lead@syntropy-demo.com";
  const [recipientEmail, setRecipientEmail] = useState(defaultEmail);

  useEffect(() => {
    if (!activeTask || activeTask.approved) return;

    let active = true;
    let stepIndex = 0;
    const processSteps = async () => {
      for (let step of negotiationSteps) {
        if (!active) return;
        setCurrentStep(stepIndex);
        await simulateAILatency(800);
        stepIndex++;
      }

      if (!active) return;
      setIsProcessing(false);
      await streamText(activeTask.prepContent, (val) => {
        if (active) setDraftEmail(val);
      }, 10);
    };

    processSteps();

    return () => {
      active = false;
    };
  }, [activeTask]);

  const handleSaveToDoc = async () => {
    setIsActionActive(true);
    try {
      if (onCompletePrep) {
        await onCompletePrep(activeTask.id);
      }
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
      if (onCompleteNegotiation) {
        await onCompleteNegotiation(activeTask.id, recipientEmail);
      }
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
        <CalendarClock size={32} className="text-zinc-700 mb-3 animate-pulse" />
        <h4 className="text-sm font-semibold text-zinc-500">Negotiation Core Idle</h4>
        <p className="text-xs text-zinc-500 max-w-xs mt-1">
          Click &ldquo;Negotiate&rdquo; on any task to trigger the timeline rescheduling negotiator.
        </p>
      </div>
    );
  }

  const isApproved = activeTask.approved || isDocSynced || isGmailSynced;

  return (
    <div className="glass-panel rounded-2xl p-6 border-gradient-violet glow-violet h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/40 mb-4">
          <div className="flex items-center gap-2">
            <CalendarClock size={16} className="text-[#8b5cf6]" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Timeline Rescheduling Negotiator
            </h3>
          </div>
          <span className="text-[9px] font-mono text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-900">
            Task ID: {activeTask.id}
          </span>
        </div>

        {/* AI Agent Step Tracker */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 uppercase">
            <span>Agent Orchestration</span>
            <span>{currentStep + 1} / {negotiationSteps.length}</span>
          </div>

          <div className="p-3 bg-zinc-950/60 border border-zinc-900/60 rounded-xl space-y-1.5 min-h-[90px]">
            {negotiationSteps.map((step, idx) => {
              const isActive = idx === currentStep && isProcessing;
              const isCompleted = idx < currentStep || (!isProcessing && idx === negotiationSteps.length - 1);
              
              return (
                <div key={idx} className="flex items-center gap-2.5 text-[11px] font-mono">
                  {isActive ? (
                    <RefreshCw size={12} className="text-[#8b5cf6] animate-spin shrink-0" />
                  ) : isCompleted ? (
                    <Check size={12} className="text-emerald-500 shrink-0" />
                  ) : (
                    <div className="h-1.5 w-1.5 rounded-full bg-zinc-800 shrink-0 ml-1" />
                  )}
                  
                  <span className={isActive ? "text-[#8b5cf6]" : isCompleted ? "text-zinc-400" : "text-zinc-650"}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Generated Artifact Pane */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
            {activeTask.prepTitle}
          </span>

          <div className="h-44 bg-zinc-950 border border-zinc-900 rounded-xl p-3.5 overflow-y-auto font-mono text-[11px] leading-relaxed text-zinc-300">
            {draftEmail ? (
              <pre className="whitespace-pre-wrap font-mono">{draftEmail}</pre>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-600 font-sans gap-2 text-xs">
                <Mail size={14} className="animate-pulse text-[#8b5cf6]" />
                <span>AI Rescheduling negotiator calculating density...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recipient Details & Sync Buttons */}
      <div className="pt-4 mt-4 border-t border-zinc-800/40 space-y-4">
        
        {/* Recipient Email Input */}
        {!isApproved && (
          <div className="space-y-1">
            <label className="text-[9px] font-mono text-zinc-500 uppercase block">Recipient Email</label>
            <div className="relative">
              <input 
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                disabled={isProcessing || !draftEmail}
                className="w-full bg-zinc-950 border border-zinc-900 rounded-xl py-1.5 pl-8 pr-3 text-[11px] text-zinc-200 focus:outline-none focus:border-[#8b5cf6]/45 disabled:opacity-50"
              />
              <Mail size={12} className="text-zinc-650 absolute left-2.5 top-2.5" />
            </div>
          </div>
        )}

        {/* Action Options */}
        {!isApproved ? (
          <div className="grid grid-cols-2 gap-3">
            {/* Save to Google Docs */}
            <button
              onClick={handleSaveToDoc}
              disabled={isProcessing || isActionActive || !draftEmail}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                isProcessing || isActionActive || !draftEmail
                  ? "bg-zinc-900 text-zinc-600 border border-zinc-800/40 cursor-not-allowed"
                  : "bg-zinc-900 border border-zinc-850 hover:border-zinc-800 text-white font-semibold"
              }`}
            >
              <FileText size={12} className="text-[#8b5cf6]" />
              Save in Doc
            </button>

            {/* Send via Email */}
            <button
              onClick={handleSendEmail}
              disabled={isProcessing || isActionActive || !draftEmail}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                isProcessing || isActionActive || !draftEmail
                  ? "bg-zinc-900 text-zinc-600 border border-zinc-800/40 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] text-black hover:opacity-90 font-bold"
              }`}
            >
              <Send size={12} />
              Send via Email
            </button>
          </div>
        ) : (
          <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-semibold flex flex-col items-center justify-center gap-2 text-center w-full font-sans">
            <div className="flex items-center gap-2">
              <Check size={14} />
              Commitment processed & workspace updated
            </div>
            
            {/* Show Doc Redirect link if document exists */}
            {(activeTask.docUrl || isDocSynced) && (
              <a 
                href={activeTask.docUrl || "https://docs.google.com"} 
                target="_blank" 
                rel="noreferrer"
                className="text-[#06b6d4] hover:text-[#0891b2] font-bold flex items-center gap-1 mt-1 text-[11px] underline"
              >
                Open Google Doc
                <ExternalLink size={10} />
              </a>
            )}

            {/* Show Gmail confirmation if Gmail draft exists */}
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
