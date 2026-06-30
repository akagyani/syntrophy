/**
 * Helper to simulate streaming text character by character
 */
export async function streamText(text, callback, speed = 15) {
  let currentText = "";
  for (let i = 0; i < text.length; i++) {
    currentText += text[i];
    callback(currentText);
    await new Promise((resolve) => setTimeout(resolve, speed));
  }
}

/**
 * Simulates a delay for an AI agent's reasoning process
 */
export async function simulateAILatency(ms = 2000) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * AI steps for preparing the client call
 */
export const clientCallPrepSteps = [
  "Ingesting Gmail thread history...",
  "Analyzing client sentiment (Angry / Escalated)...",
  "Checking local Git log for deployment issues...",
  "Identifying API integration failure on Tuesday...",
  "Synthesizing status update report...",
  "Drafting professional client response email...",
];

/**
 * AI steps for negotiating the assignment extension
 */
export const negotiationSteps = [
  "Calculating calendar density for next 48 hours...",
  "Predicting student cognitive load...",
  "Drafting polite extension request to Prof. Hargrove...",
  "Proposing optimal submission slot: Thursday 5:00 PM...",
];
