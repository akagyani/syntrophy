import { NextResponse } from 'next/server';
import { adminDb, adminMessaging } from '../../../lib/firebaseAdmin';
import { fetchGoogleCalendarEvents } from '../../../lib/workspace';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const usersSnapshot = await adminDb.collection('users').get();
    let processedUsers = 0;

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const uid = userDoc.id;
      const { accessToken, fcmTokens } = userData;

      if (!accessToken) continue;

      try {
        // 1. Fetch Calendar Events
        const events = await fetchGoogleCalendarEvents(accessToken);
        
        if (events && events.length > 2) { // Arbitrary threshold for MVP
          // 2. Risk Analysis via Gemini
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
          const prompt = `
            Analyze this schedule for burnout risk. 
            Events: ${JSON.stringify(events)}
            If there are too many back-to-back meetings, respond with EXACTLY this JSON format (no markdown):
            {"atRisk": true, "reason": "3 back-to-back client calls detected."}
            Otherwise:
            {"atRisk": false}
          `;
          
          const result = await model.generateContent(prompt);
          const responseText = result.response.text().trim().replace(/```json/g, "").replace(/```/g, "");
          
          let aiAnalysis;
          try {
            aiAnalysis = JSON.parse(responseText);
          } catch (e) {
            console.error("Failed to parse Gemini output:", responseText);
            continue;
          }

          if (aiAnalysis.atRisk) {
            // 3. Create Task
            const taskId = `cron-risk-${Date.now()}`;
            await adminDb.collection('users').doc(uid).collection('tasks').doc(taskId).set({
              id: taskId,
              title: "Proactive Burnout Mitigation",
              description: aiAnalysis.reason,
              category: "Health",
              status: "unprepared",
              risk: "critical",
              time: "Auto-generated",
              context: {
                description: "AI detected severe calendar congestion. Recommend pushing non-essential tasks."
              }
            });

            // 4. Send FCM Push Notification
            if (fcmTokens && fcmTokens.length > 0) {
              const message = {
                notification: {
                  title: 'Syntropy Alert: High Burnout Risk Detected',
                  body: aiAnalysis.reason,
                },
                tokens: fcmTokens // Multicast message
              };
              
              await adminMessaging.sendEachForMulticast(message);
              console.log(`FCM sent to user ${uid}`);
            }
          }
        }
        processedUsers++;
      } catch (err) {
        console.warn(`Failed to process user ${uid}:`, err.message);
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Background scheduler execution completed.',
      processedUsers
    });
  } catch (error) {
    console.error("Cron Execution Failed:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
