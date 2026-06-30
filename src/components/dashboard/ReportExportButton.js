"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileDown, Loader2, Check, ChevronDown, ChevronUp } from "lucide-react";
import { buildReportData, exportReportAsPDF } from "../../lib/reportGenerator";
import ReportTemplate from "./ReportTemplate";

/**
 * ReportExportButton
 * Drop-in button that aggregates Syntropy data, renders a hidden ReportTemplate,
 * captures it with html2canvas, and downloads the result as a styled PDF.
 */
export default function ReportExportButton({ user, tasks = [], calEvents = [], burnoutData = {} }) {
  const [status, setStatus] = useState("idle"); // idle | generating | exporting | done | error
  const [report, setReport] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const statusLabel = {
    idle: "Export PDF Report",
    generating: "Collecting data...",
    exporting: "Rendering PDF...",
    done: "Report Downloaded!",
    error: "Export Failed — Retry"
  };

  const handleExport = async () => {
    if (status === "generating" || status === "exporting") return;
    setStatus("generating");
    setErrorMsg("");

    try {
      // 1. Build the report data object
      const reportData = buildReportData({ user, tasks, calEvents, burnoutData });
      setReport(reportData);

      // 2. Small delay to let React render the hidden ReportTemplate
      await new Promise(r => setTimeout(r, 300));

      setStatus("exporting");

      // 3. Capture + export
      const now = new Date();
      const fileName = `syntropy-report-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}.pdf`;
      await exportReportAsPDF("syntropy-report-template", fileName);

      setStatus("done");
      setTimeout(() => setStatus("idle"), 4000);
    } catch (err) {
      console.error("PDF export error:", err);
      setErrorMsg(err.message);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  const isLoading = status === "generating" || status === "exporting";

  return (
    <>
      {/* Hidden report template for html2canvas capture */}
      {report && <ReportTemplate report={report} id="syntropy-report-template" />}

      <div className="space-y-3">
        {/* Main Export Button */}
        <button
          onClick={handleExport}
          disabled={isLoading}
          className={`w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
            status === "done"
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
              : status === "error"
              ? "bg-red-500/10 border border-red-500/30 text-red-400"
              : isLoading
              ? "bg-zinc-900/60 border border-zinc-800 text-zinc-500 cursor-wait"
              : "bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] text-black hover:opacity-90 shadow-lg shadow-[#8b5cf6]/20"
          }`}
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : status === "done" ? (
            <Check size={16} />
          ) : (
            <FileDown size={16} />
          )}
          {statusLabel[status]}
        </button>

        {/* Error Detail */}
        {status === "error" && errorMsg && (
          <p className="text-[10px] text-red-400/70 font-mono text-center px-2">{errorMsg}</p>
        )}

        {/* Progress Indicator */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-2 px-1">
                {[
                  { label: "Aggregating task data", done: true },
                  { label: "Compiling burnout metrics", done: status === "exporting" },
                  { label: "Rendering PDF template", done: false }
                ].map(({ label, done }, i) => (
                  <div key={i} className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                    {done ? (
                      <Check size={10} className="text-emerald-500 shrink-0" />
                    ) : (
                      <Loader2 size={10} className="animate-spin text-[#8b5cf6] shrink-0" />
                    )}
                    {label}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Preview toggle */}
        {report && status === "idle" && (
          <button
            onClick={() => setShowPreview(v => !v)}
            className="w-full flex items-center justify-center gap-1.5 text-[10px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
          >
            {showPreview ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
            {showPreview ? "Hide" : "Preview"} report summary
          </button>
        )}

        {/* Inline mini-preview */}
        <AnimatePresence>
          {showPreview && report && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl space-y-2 text-[10px] font-mono text-zinc-400">
                <div className="flex justify-between">
                  <span>Total Commitments</span>
                  <span className="text-white font-bold">{report.kpis.totalCommitments}</span>
                </div>
                <div className="flex justify-between">
                  <span>Completion Rate</span>
                  <span className="text-emerald-400 font-bold">{report.kpis.completionRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Emails Drafted</span>
                  <span className="text-[#06b6d4] font-bold">{report.kpis.emailsDrafted}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Burnout Score</span>
                  <span className="text-rose-400 font-bold">{report.kpis.avgBurnoutScore}/100</span>
                </div>
                <div className="flex justify-between">
                  <span>Autonomous Actions</span>
                  <span className="text-[#a78bfa] font-bold">{report.kpis.autonomousActions}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
