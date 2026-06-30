/**
 * Utility to communicate directly with Google Workspace REST APIs (Gmail, Docs & Calendar)
 * utilizing the client-side Google OAuth accessToken.
 */

// Helper to base64url encode a string (required for Gmail raw MIME)
function base64urlEncode(str) {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Fetches today's Google Calendar events using the Calendar API v3.
 * Returns an array of event objects with title, start, end, and colorId.
 */
export async function fetchGoogleCalendarEvents(accessToken) {
  try {
    // Get start of today (midnight) and end of today (23:59:59) in ISO format
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const params = new URLSearchParams({
      calendarId: "primary",
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: "true",
      orderBy: "startTime",
      maxResults: "20"
    });

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      }
    );

    if (!res.ok) {
      const errText = await res.text();

      // 401 = token expired or revoked → signal caller to re-auth silently
      if (res.status === 401) {
        const expiredErr = new Error("Google OAuth token expired. Re-authorization required.");
        expiredErr.name = "TokenExpiredError";
        throw expiredErr;
      }

      // Detect scope-specific 403s and throw a recognisable error type
      if (res.status === 403) {
        let parsed = {};
        try { parsed = JSON.parse(errText); } catch (_) {}
        const reason = parsed?.error?.details?.[0]?.reason || parsed?.error?.errors?.[0]?.reason || "";
        if (reason === "ACCESS_TOKEN_SCOPE_INSUFFICIENT" || reason === "insufficientPermissions") {
          const scopeErr = new Error("Calendar access not granted. Please re-authorize to allow Google Calendar.");
          scopeErr.name = "ScopeError";
          throw scopeErr;
        }
      }

      throw new Error(`Failed to fetch Calendar events: ${res.status} ${res.statusText} - ${errText}`);
    }

    const data = await res.json();
    const events = data.items || [];

    // Normalize Google Calendar event schema into Syntropy format
    return events.map((event) => ({
      id: event.id,
      title: event.summary || "Untitled Event",
      start: event.start?.dateTime || event.start?.date || "",
      end: event.end?.dateTime || event.end?.date || "",
      color: event.colorId ? getColorFromId(event.colorId) : "cyan",
      description: event.description || "",
      source: "google-calendar"
    }));

  } catch (err) {
    if (err.name === "TokenExpiredError" || err.name === "ScopeError") {
      throw err;
    }
    console.error("Google Calendar API Error:", err);
    // Return empty array instead of crashing the UI
    return [];
  }
}

/**
 * Map Google Calendar colorId (1-11) to CSS-friendly color names.
 */
function getColorFromId(colorId) {
  const map = {
    "1": "cyan",
    "2": "emerald",
    "3": "violet",
    "4": "rose",
    "5": "amber",
    "6": "orange",
    "7": "cyan",
    "8": "zinc",
    "9": "indigo",
    "10": "emerald",
    "11": "red"
  };
  return map[colorId] || "cyan";
}

/**
 * Creates a Google Doc with task pre-work outline content.
 */
export async function createGoogleDoc(accessToken, title, content) {
  try {
    // 1. Create empty document
    const createRes = await fetch("https://docs.googleapis.com/v1/documents", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ title })
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      if (createRes.status === 401) {
        const expiredErr = new Error("Google OAuth token expired or missing scope. Re-authorization required.");
        expiredErr.name = "TokenExpiredError";
        throw expiredErr;
      }
      throw new Error(`Failed to create Doc: ${createRes.status} ${createRes.statusText} - ${errText}`);
    }

    const docData = await createRes.json();
    const documentId = docData.documentId;

    // 2. Populate document with outline content via batchUpdate
    const updateRes = await fetch(
      `https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          requests: [
            {
              insertText: {
                location: { index: 1 },
                text: content
              }
            }
          ]
        })
      }
    );

    if (!updateRes.ok) {
      const errText = await updateRes.text();
      throw new Error(`Failed to update Doc content: ${updateRes.status} ${updateRes.statusText} - ${errText}`);
    }

    return {
      docId: documentId,
      url: `https://docs.google.com/document/d/${documentId}/edit`
    };
  } catch (err) {
    console.error("Google Docs API Error:", err);
    throw err;
  }
}

/**
 * Creates a Gmail draft containing the extension request.
 */
export async function createGmailDraft(accessToken, to, subject, body) {
  try {
    // Format SMTP MIME message
    const emailMIME = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/plain; charset="UTF-8"',
      'MIME-Version: 1.0',
      '',
      body
    ].join('\r\n');

    const rawMessage = base64urlEncode(emailMIME);

    const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/drafts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: {
          raw: rawMessage
        }
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      
      if (res.status === 401) {
        const expiredErr = new Error("Google OAuth token expired or missing scope. Re-authorization required.");
        expiredErr.name = "TokenExpiredError";
        throw expiredErr;
      }
      
      throw new Error(`Failed to create Gmail draft: ${res.status} ${res.statusText} - ${errText}`);
    }

    const data = await res.json();
    return {
      draftId: data.id,
      success: true
    };
  } catch (err) {
    console.error("Gmail API Error:", err);
    throw err;
  }
}
