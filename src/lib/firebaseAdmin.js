import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

// Initialize the Firebase Admin SDK
if (!getApps().length) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      initializeApp({
        credential: cert(serviceAccount)
      });
      console.log("Firebase Admin Initialized via Service Account JSON");
    } else if (process.env.FIREBASE_PRIVATE_KEY) {
      initializeApp({
        credential: cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        })
      });
      console.log("Firebase Admin Initialized via explicit Env Vars");
    } else {
      console.warn("Firebase Admin Initialization Skipped: Missing Credentials (expected during build)");
    }
  } catch (error) {
    console.error("Firebase Admin Initialization Error:", error);
  }
}

// Only export the initialized SDK objects if the app was successfully created.
// This prevents Next.js from crashing during the build phase.
export const adminDb = getApps().length > 0 ? getFirestore() : null;
export const adminMessaging = getApps().length > 0 ? getMessaging() : null;
