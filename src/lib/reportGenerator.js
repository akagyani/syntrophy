/**
 * reportGenerator.js
 * Aggregates all Syntropy user data into a structured report object
 * and exports it as a downloadable PDF using jsPDF + html2canvas.
 */

/**
 * Builds a normalized report data object from all Syntropy data sources.
 */
export function buildReportData({ user, tasks = [], calEvents = [], burnoutData = {}, period }) {
  const completed = tasks.filter(t => t.approved || t.status === "completed");
  const negotiated = tasks.filter(
    t => (t.aiActionType === "negotiate" || t.aiActionType === "negotiation") && t.outcomeLog?.extensionGranted
  );
  const critical = tasks.filter(t => t.risk === "critical");
  const allDrafts = tasks.flatMap(t => t.emailDrafts || []);
  const autonomousActions = allDrafts.length + negotiated.length;

  const avgBurnout = burnoutData?.avgScore ??
    (burnoutData?.timeline?.length
      ? Math.round(burnoutData.timeline.reduce((s, d) => s + (d.score || 0), 0) / burnoutData.timeline.length)
      : 68);

  const now = new Date();
  const defaultPeriod = period || {
    from: new Date(now.getFullYear(), now.getMonth(), 1).toLocaleDateString("en-GB"),
    to: now.toLocaleDateString("en-GB")
  };

  return {
    meta: {
      title: "Syntropy Execution Report",
      period: defaultPeriod,
      generatedAt: now.toISOString(),
      generatedAtFormatted: now.toLocaleString("en-IN"),
      userName: user?.displayName || "Syntropy User",
      userEmail: user?.email || ""
    },
    kpis: {
      totalCommitments: tasks.length,
      completed: completed.length,
      completionRate: tasks.length ? Math.round((completed.length / tasks.length) * 100) : 0,
      negotiationsWon: negotiated.length,
      criticalTasks: critical.length,
      emailsDrafted: allDrafts.length,
      avgBurnoutScore: avgBurnout,
      autonomousActions
    },
    taskBreakdown: tasks.map(t => ({
      title: t.title,
      category: t.category || "—",
      deadline: t.deadline || t.time || "—",
      risk: t.risk || "low",
      status: t.approved ? "Completed" : (t.aiActionType === "negotiate" || t.aiActionType === "negotiation") ? "Negotiated" : "Pending",
      draftsSent: (t.emailDrafts || []).length,
      progress: t.context?.percentComplete ?? 0
    })),
    burnoutTimeline: burnoutData?.timeline || [
      { day: "Mon", score: 72 }, { day: "Tue", score: 78 }, { day: "Wed", score: 85 },
      { day: "Thu", score: 68 }, { day: "Fri", score: 74 }
    ],
    negotiationLog: tasks
      .filter(t => t.aiActionType === "negotiate" || t.aiActionType === "negotiation")
      .map(t => ({
        task: t.title,
        recipient: t.recipients?.[0] || t.context?.recipientEmail || "Unknown",
        outcome: t.outcomeLog?.extensionGranted ? "Granted" : "Pending",
        newDeadline: t.outcomeLog?.newDeadline || "—",
        emailsSent: (t.emailDrafts || []).length
      })),
    calendarSummary: calEvents.slice(0, 5).map(e => ({
      title: e.title,
      time: e.start ? new Date(e.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"
    }))
  };
}

/**
 * Renders the hidden report element to canvas and downloads as PDF.
 * @param {string} reportElementId - DOM id of the ReportTemplate element
 * @param {string} fileName - output file name
 */
export async function exportReportAsPDF(reportElementId, fileName = "syntropy-report.pdf") {
  // Dynamically import to avoid SSR issues
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import("jspdf"),
    import("html2canvas")
  ]);

  const element = document.getElementById(reportElementId);
  if (!element) throw new Error(`Report DOM element #${reportElementId} not found`);

  // Temporarily make visible for capture
  const prev = element.style.cssText;
  element.style.cssText = "position:fixed;top:0;left:0;z-index:-1;opacity:1;pointer-events:none;";

  let pdf;
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: "#09090b",
      useCORS: true,
      logging: false
    });

    const imgData = canvas.toDataURL("image/png");
    const pxWidth = canvas.width / 2;
    const pxHeight = canvas.height / 2;

    // A4-like proportions
    const pageW = 210; // mm
    const pageH = (pxHeight / pxWidth) * pageW;

    pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: [pageW, pageH] });
    pdf.addImage(imgData, "PNG", 0, 0, pageW, pageH);
    pdf.save(fileName);
  } finally {
    element.style.cssText = prev;
  }

  return { success: true };
}
