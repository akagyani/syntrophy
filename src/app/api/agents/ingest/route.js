import { NextResponse } from "next/server";

/**
 * Webhook for Google Calendar/Gmail updates.
 * Ingests external event notifications and updates the context window.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, type, source, payload } = body;

    if (!userId || !type || !payload) {
      return NextResponse.json(
        { error: "Missing required fields: userId, type, payload" },
        { status: 400 }
      );
    }

    console.log(`Ingested event of type [${type}] from [${source || "unknown"}] for user [${userId}]`);

    // In a production backend, this would vectorize the payload and store it in Pinecone,
    // and write the context updates into Firestore.
    return NextResponse.json({
      success: true,
      message: "Event context ingested successfully.",
      ingestedId: `ingest-${Date.now()}`,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("Ingest webhook error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}
