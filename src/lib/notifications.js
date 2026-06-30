import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { app } from "./firebase"; // Ensure firebase.js exports 'app'

/**
 * Initializes Firebase Cloud Messaging to receive push notifications.
 * Requires a VAPID key from the Firebase Console (Cloud Messaging tab).
 */
export async function requestNotificationPermission() {
  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    console.warn("FCM VAPID key is missing. Push notifications disabled.");
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const messaging = getMessaging(app);
      const currentToken = await getToken(messaging, { vapidKey });
      
      if (currentToken) {
        // You would typically save this token to Firestore under the user's document
        // so your backend can send them push messages.
        console.log("FCM Token acquired:", currentToken);
        return currentToken;
      } else {
        console.warn("No registration token available. Request permission to generate one.");
        return null;
      }
    } else {
      console.warn("Notification permission denied.");
      return null;
    }
  } catch (error) {
    console.error("An error occurred while retrieving token. ", error);
    return null;
  }
}

/**
 * Listens for foreground messages when the app is open.
 */
export function listenForForegroundMessages(callback) {
  try {
    const messaging = getMessaging(app);
    onMessage(messaging, (payload) => {
      console.log("Foreground message received:", payload);
      if (callback) callback(payload);
    });
  } catch (err) {
    console.error("Failed to set up foreground listener", err);
  }
}
