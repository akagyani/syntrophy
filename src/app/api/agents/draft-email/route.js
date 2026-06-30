import { NextResponse } from "next/server";
import { buildEmailPrompt } from "../../../../lib/emailDraftEngine";

export async function POST(request) {
  try {
    const body = await request.json();
    const { task, recipient, user, tone = "formal", wordLimit = 180 } = body;

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: "Gemini API key is not configured on the server." }, { status: 500 });
    }

    const prompt = buildEmailPrompt({ task, recipient, user, tone, wordLimit });

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 600,
            topP: 0.8
          }
        })
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini API error:", errText);
      return NextResponse.json({ error: "Failed to generate draft from Gemini API.", details: errText }, { status: 502 });
    }

    const data = await geminiRes.json();
    const draft = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    
    if (!draft) {
      return NextResponse.json({ error: "Gemini returned an empty response." }, { status: 500 });
    }

    return NextResponse.json({ draft, source: "gemini" });
  } catch (err) {
    console.error("draft-email route error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
