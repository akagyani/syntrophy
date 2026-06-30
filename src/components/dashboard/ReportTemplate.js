"use client";

import React from "react";

/**
 * ReportTemplate — hidden DOM component rendered off-screen and captured
 * by html2canvas for PDF export. Styles are inline to survive canvas capture.
 */
export default function ReportTemplate({ report, id = "syntropy-report-template" }) {
  if (!report) return null;
  const { meta, kpis, taskBreakdown, negotiationLog, burnoutTimeline } = report;

  const riskColor = (risk) => {
    if (risk === "critical") return "#f87171";
    if (risk === "high") return "#fbbf24";
    return "#34d399";
  };
  const statusColor = (status) => {
    if (status === "Completed") return "#34d399";
    if (status === "Negotiated") return "#a78bfa";
    return "#71717a";
  };

  return (
    <div
      id={id}
      style={{
        position: "fixed", top: 0, left: 0,
        zIndex: -9999, opacity: 0, pointerEvents: "none",
        width: 900, fontFamily: "'Inter', 'Segoe UI', sans-serif",
        background: "#09090b", color: "#fff", padding: 48
      }}
    >
      {/* ── Cover ── */}
      <div style={{ borderBottom: "2px solid #8b5cf6", paddingBottom: 24, marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: "#fff", margin: 0, letterSpacing: -1 }}>Syntropy</h1>
          <p style={{ fontSize: 13, color: "#8b5cf6", margin: "4px 0 0", fontWeight: 600 }}>Autonomous Execution Report</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: 11, color: "#71717a", margin: 0 }}>Generated: {meta.generatedAtFormatted}</p>
          <p style={{ fontSize: 13, color: "#a1a1aa", margin: "2px 0 0", fontWeight: 600 }}>{meta.userName}</p>
          <p style={{ fontSize: 11, color: "#52525b", margin: 0 }}>{meta.userEmail}</p>
        </div>
      </div>

      {/* ── Period Banner ── */}
      <div style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 12, padding: "12px 20px", marginBottom: 28, display: "flex", gap: 32 }}>
        <div>
          <p style={{ fontSize: 9, color: "#52525b", margin: 0, textTransform: "uppercase", letterSpacing: 1 }}>Report Period</p>
          <p style={{ fontSize: 13, color: "#e4e4e7", margin: "2px 0 0", fontWeight: 700 }}>{meta.period?.from} → {meta.period?.to}</p>
        </div>
        <div>
          <p style={{ fontSize: 9, color: "#52525b", margin: 0, textTransform: "uppercase", letterSpacing: 1 }}>Autonomous Actions Taken</p>
          <p style={{ fontSize: 13, color: "#8b5cf6", margin: "2px 0 0", fontWeight: 700 }}>{kpis.autonomousActions} by Syntropy AI</p>
        </div>
      </div>

      {/* ── KPI Grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 32 }}>
        {[
          { label: "Total Commitments", value: kpis.totalCommitments, accent: "#8b5cf6" },
          { label: "Completion Rate", value: `${kpis.completionRate}%`, accent: "#34d399" },
          { label: "Negotiations Won", value: kpis.negotiationsWon, accent: "#a78bfa" },
          { label: "Critical Tasks", value: kpis.criticalTasks, accent: "#f87171" },
          { label: "Emails Drafted", value: kpis.emailsDrafted, accent: "#06b6d4" },
          { label: "Avg Burnout Score", value: `${kpis.avgBurnoutScore}/100`, accent: kpis.avgBurnoutScore > 75 ? "#f87171" : "#fbbf24" }
        ].map(({ label, value, accent }) => (
          <div key={label} style={{ background: "#18181b", borderRadius: 12, padding: 18, border: "1px solid #27272a" }}>
            <p style={{ fontSize: 9, color: "#71717a", margin: 0, textTransform: "uppercase", letterSpacing: 1 }}>{label}</p>
            <p style={{ fontSize: 26, fontWeight: 800, color: accent, margin: "6px 0 0" }}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Burnout Spark Chart ── */}
      {burnoutTimeline?.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: "#e4e4e7", margin: "0 0 12px" }}>Stress / Burnout Timeline</h2>
          <div style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 12, padding: 16, display: "flex", alignItems: "flex-end", gap: 10, height: 80 }}>
            {burnoutTimeline.map((d, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{
                  width: "100%", borderRadius: 4,
                  height: `${Math.round((d.score / 100) * 52)}px`,
                  background: d.score > 80 ? "#f87171" : d.score > 65 ? "#fbbf24" : "#34d399"
                }} />
                <span style={{ fontSize: 9, color: "#52525b" }}>{d.day}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Commitment Log ── */}
      <h2 style={{ fontSize: 13, fontWeight: 700, color: "#e4e4e7", margin: "0 0 12px" }}>Commitment Log</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, marginBottom: 32 }}>
        <thead>
          <tr style={{ background: "#27272a" }}>
            {["Task", "Category", "Deadline", "Progress", "Risk", "Status"].map(h => (
              <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: "#a1a1aa", fontWeight: 600, fontSize: 10 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {taskBreakdown.map((t, i) => (
            <tr key={i} style={{ borderBottom: "1px solid #27272a", background: i % 2 === 0 ? "transparent" : "#18181b11" }}>
              <td style={{ padding: "9px 12px", color: "#e4e4e7", fontWeight: 600 }}>{t.title}</td>
              <td style={{ padding: "9px 12px", color: "#a1a1aa" }}>{t.category}</td>
              <td style={{ padding: "9px 12px", color: "#a1a1aa", fontFamily: "monospace", fontSize: 10 }}>{t.deadline}</td>
              <td style={{ padding: "9px 12px", color: "#a1a1aa" }}>{t.progress}%</td>
              <td style={{ padding: "9px 12px", color: riskColor(t.risk), fontWeight: 700, textTransform: "capitalize" }}>{t.risk}</td>
              <td style={{ padding: "9px 12px", color: statusColor(t.status), fontWeight: 600 }}>{t.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── Negotiation Log ── */}
      {negotiationLog?.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: "#e4e4e7", margin: "0 0 12px" }}>AI Negotiation Audit</h2>
          {negotiationLog.map((n, i) => (
            <div key={i} style={{ background: "#18181b", borderRadius: 8, padding: "10px 14px", marginBottom: 8, border: "1px solid #3f3f46", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ color: "#a78bfa", fontWeight: 700 }}>{n.task}</span>
                <span style={{ color: "#71717a", fontSize: 10, marginLeft: 10 }}>→ {n.recipient}</span>
              </div>
              <div style={{ textAlign: "right", fontSize: 10 }}>
                <span style={{ color: n.outcome === "Granted" ? "#34d399" : "#fbbf24", fontWeight: 600 }}>{n.outcome}</span>
                {n.newDeadline !== "—" && <span style={{ color: "#52525b", marginLeft: 8 }}>New: {n.newDeadline}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Footer ── */}
      <div style={{ paddingTop: 16, borderTop: "1px solid #27272a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 9, color: "#3f3f46" }}>Generated by Syntropy AI · syntropy-e7234.firebaseapp.com</span>
        <span style={{ fontSize: 9, color: "#3f3f46" }}>{meta.generatedAtFormatted}</span>
      </div>
    </div>
  );
}
