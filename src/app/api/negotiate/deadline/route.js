import { NextResponse } from "next/server";

/**
 * Triggers the Negotiation Agent to write extension drafts.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, taskId, title, recipientEmail, reason } = body;

    if (!userId || !taskId) {
      return NextResponse.json(
        { error: "Missing required fields: userId, taskId" },
        { status: 400 }
      );
    }

    // In production, this agent checks calendar availability, calculates stress density,
    // and drafts a highly optimal extension request based on past successful communications.
    const to = recipientEmail || "recipient@domain.com";
    const subject = `Extension Request: ${title || "Commitment Delay"}`;
    const draftText = `To: ${to}\nSubject: ${subject}\n\nDear recipient,\n\nI am writing to request a short extension on ${title || "our commitment"} originally due today.\n\nDue to an unexpected schedule overlap, my available work window was constrained. I am requesting a 24-hour extension to complete integration checks.\n\nThank you,\nAlex`;

    return NextResponse.json({
      success: true,
      taskId,
      to,
      subject,
      draftEmail: draftText,
      negotiatedSlot: "Tomorrow, 10:00 AM",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("Negotiation API error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}
