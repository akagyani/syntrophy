import { NextResponse } from "next/server";
import { buildReportData } from "../../../../lib/reportGenerator";

export async function POST(request) {
  try {
    const body = await request.json();
    const { user, tasks, calEvents, burnoutData, period } = body;

    const report = buildReportData({ user, tasks, calEvents, burnoutData, period });
    return NextResponse.json({ report });
  } catch (err) {
    console.error("reports/generate error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
