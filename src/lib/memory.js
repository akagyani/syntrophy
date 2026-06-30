/**
 * AI Memory Service (Pinecone Integration)
 * Converts task context into vector embeddings using Gemini and stores them in Pinecone
 * for long-term semantic memory and retrieval.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini for Embeddings
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Generates an embedding vector for a given text using Gemini's text-embedding-004 model.
 */
export async function generateEmbedding(text) {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("Missing GEMINI_API_KEY for embeddings.");
    return [];
  }
  try {
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error("Embedding generation failed:", error);
    return [];
  }
}

/**
 * Stores a contextual memory in Pinecone.
 * Requires PINECONE_API_KEY and PINECONE_INDEX_HOST.
 */
export async function storeMemory(userId, taskId, contextText, metadata = {}) {
  const apiKey = process.env.PINECONE_API_KEY;
  const host = process.env.PINECONE_INDEX_HOST;

  if (!apiKey || !host) {
    console.warn("Pinecone environment variables missing. Memory not stored.");
    return false;
  }

  const vector = await generateEmbedding(contextText);
  if (!vector.length) return false;

  try {
    const response = await fetch(`https://${host}/vectors/upsert`, {
      method: "POST",
      headers: {
        "Api-Key": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        vectors: [
          {
            id: `user_${userId}_task_${taskId}_${Date.now()}`,
            values: vector,
            metadata: {
              userId,
              taskId,
              text: contextText,
              timestamp: new Date().toISOString(),
              ...metadata
            }
          }
        ],
        namespace: "syntropy-memory"
      })
    });

    if (!response.ok) {
      throw new Error(`Pinecone upsert failed: ${response.statusText}`);
    }

    return true;
  } catch (err) {
    console.error("Failed to store memory in Pinecone:", err);
    return false;
  }
}

/**
 * Retrieves relevant memories for a given query text using semantic search.
 */
export async function retrieveMemories(userId, queryText, topK = 3) {
  const apiKey = process.env.PINECONE_API_KEY;
  const host = process.env.PINECONE_INDEX_HOST;

  if (!apiKey || !host) {
    console.warn("Pinecone environment variables missing. Memory retrieval skipped.");
    return [];
  }

  const queryVector = await generateEmbedding(queryText);
  if (!queryVector.length) return [];

  try {
    const response = await fetch(`https://${host}/query`, {
      method: "POST",
      headers: {
        "Api-Key": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        vector: queryVector,
        topK,
        namespace: "syntropy-memory",
        includeMetadata: true,
        filter: {
          userId: { "$eq": userId }
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Pinecone query failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.matches.map(match => match.metadata);
  } catch (err) {
    console.error("Failed to retrieve memories from Pinecone:", err);
    return [];
  }
}
