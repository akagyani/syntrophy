/**
 * emailDraftEngine.js
 * Builds structured Gemini prompts from rich task + recipient context,
 * then calls the /api/agents/draft-email route to get an AI-generated draft.
 */

/**
 * Builds a detailed Gemini prompt from full task + recipient + user context.
 * Returns a prompt string ready to send to Gemini.
 */
export function buildEmailPrompt({ task, recipient, user, tone = "formal", wordLimit = 180 }) {
  const senderName = user?.displayName || "User";
  const senderEmail = user?.email || "";
  const senderRole = user?.role || "";
  const signature = user?.emailSignature || senderName;

  const recipientName = recipient?.name || "Recipient";
  const recipientRole = recipient?.role || "";
  const relationship = recipient?.relationship || "professional";
  const historyCount = recipient?.history?.length || 0;
  const lastOutcome = recipient?.history?.[0]?.outcome || "no prior contact";

  const taskTitle = task?.title || "Task";
  const deadline = task?.deadline || "";
  const category = task?.category || "";
  const progress = task?.context?.percentComplete ?? 0;
  const blockers = task?.context?.blockers?.join(", ") || "none";
  const taskDescription = task?.context?.description || task?.description || taskTitle;
  const requestedDays = task?.context?.requestedExtensionDays || 2;
  const actionType = task?.aiActionType || "email";

  const toneGuide = {
    "formal": "strictly formal, polished, distant-professional. No contractions.",
    "formal-apologetic": "formal but with genuine remorse. Acknowledge inconvenience first.",
    "direct": "brief, confident, no fluff. 3 sentences max.",
    "friendly": "warm, human, collegial. Use the recipient's first name.",
    "apologetic": "sincere, humble, remorseful. Do not be overly dramatic."
  }[tone] || "formal";

  const actionDirective = actionType === "negotiate" || actionType === "negotiation"
    ? `Request a ${requestedDays}-day extension on the original deadline of ${deadline}. Provide ONE clear reason. State the new requested deadline explicitly.`
    : actionType === "email"
    ? "Provide a professional status update. Be specific about progress and next steps."
    : "Summarize current status and any decisions that require the recipient's input.";

  return `You are Syntropy, an AI execution partner writing a professional email on behalf of ${senderName}.

=== SENDER ===
Name: ${senderName}
Email: ${senderEmail}${senderRole ? `\nRole: ${senderRole}` : ""}
Signature: ${signature}

=== RECIPIENT ===
Name: ${recipientName}${recipientRole ? `\nRole: ${recipientRole}` : ""}
Relationship: ${relationship}
Prior Contact: ${historyCount} interaction${historyCount !== 1 ? "s" : ""} — last outcome: ${lastOutcome}

=== TASK CONTEXT ===
Task: ${taskTitle}
Category: ${category}
Deadline: ${deadline}
Progress: ${progress}%
Blockers: ${blockers}
Details: ${taskDescription}

=== DIRECTIVE ===
Action: ${actionDirective}
Tone: ${toneGuide}
Word Limit: ${wordLimit} words maximum
Language: ${user?.defaultLanguage || "en-US"}

=== OUTPUT RULES ===
1. Start directly with "Dear ${recipientName.split(" ")[0]}," — no preamble
2. State the situation in sentence 1
3. Give exactly ONE reason — do not over-explain
4. Make ONE specific ask (with concrete date if extension)
5. End with gratitude and the full signature block
6. Do NOT include a subject line — body text only
7. Return ONLY the email body

Generate the email now:`.trim();
}

/**
 * Calls the Syntropy draft-email API route and returns the AI-generated draft text.
 */
export async function generateEmailDraft({ task, recipient, user, tone, wordLimit }) {
  const res = await fetch("/api/agents/draft-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task, recipient, user, tone, wordLimit })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Draft generation failed: ${res.status} — ${err}`);
  }

  const data = await res.json();
  return data.draft || "";
}

/**
 * Computes a "context completeness" score (0-100) based on how many
 * rich fields have been filled in for a task.
 */
export function getContextScore(task, recipient) {
  let score = 0;
  const checks = [
    task?.context?.description,
    task?.context?.blockers?.length > 0,
    task?.context?.percentComplete !== undefined,
    task?.context?.requestedExtensionDays,
    recipient?.name,
    recipient?.email,
    recipient?.role,
    recipient?.relationship
  ];
  checks.forEach(c => { if (c) score += 12.5; });
  return Math.round(score);
}
