"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  updateProfile
} from "firebase/auth";
import { auth, googleProvider, db } from "../lib/firebase";
import { doc, setDoc } from "firebase/firestore";

const AuthContext = createContext({
  user: null,
  loading: true,
  loginWithGoogle: async () => {},
  logout: async () => {},
  reauthorize: async () => {}
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Monitor active Firebase authentication states
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Retrieve stored Google OAuth token (if exists)
        const storedToken = typeof window !== "undefined" ? sessionStorage.getItem("googleToken") : null;
        
        let currentName = firebaseUser.displayName;
        if (!currentName) {
          currentName = window.prompt("Welcome to Syntropy! Please enter your name:") || "User";
          updateProfile(firebaseUser, { displayName: currentName }).catch(e => console.error(e));
        }

        setUser({
          uid: firebaseUser.uid,
          displayName: currentName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL || null,
          accessToken: storedToken || null,
          isMock: false
        });
      } else {
        // No user authenticated
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setLoading(true);
    
    try {
      // 1. Try real Firebase Auth
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        // Extract Google OAuth Access Token
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;
        
        if (token && typeof window !== "undefined") {
          sessionStorage.setItem("googleToken", token);
        }

        let currentName = result.user.displayName;
        if (!currentName) {
          currentName = window.prompt("Welcome to Syntropy! Please enter your name:") || "User";
          updateProfile(result.user, { displayName: currentName }).catch(e => console.error(e));
        }

        const userData = {
          uid: result.user.uid,
          displayName: currentName,
          email: result.user.email,
          photoURL: result.user.photoURL,
          accessToken: token || null,
          isMock: false
        };

        setUser(userData);

        // Persist token to Firestore for background cron usage
        try {
          await setDoc(doc(db, "users", result.user.uid), {
            displayName: userData.displayName,
            email: userData.email,
            photoURL: userData.photoURL,
            accessToken: userData.accessToken,
            lastLogin: new Date().toISOString()
          }, { merge: true });
        } catch (dbErr) {
          console.error("Failed to sync user data to Firestore:", dbErr);
        }
      }
    } catch (error) {
      console.error("Firebase Auth failed.", error.message);
      // No fallback allowed for production
    } finally {
      setLoading(false);
    }
  };

  /**
   * Forces a fresh Google OAuth popup to obtain a new access token that
   * includes any scopes added since the user last signed in (e.g. calendar.readonly).
   * Updates the in-memory user object and sessionStorage without signing out.
   */
  const reauthorize = async () => {
    try {
      // Force consent prompt so Google issues a fresh token with current scopes
      googleProvider.setCustomParameters({ prompt: "consent" });
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;

      if (token && typeof window !== "undefined") {
        sessionStorage.setItem("googleToken", token);
      }

      // Patch the user object in-place so the whole app gets the new token
      setUser(prev => ({ ...prev, accessToken: token || null }));
      return token;
    } catch (error) {
      console.error("Reauthorize failed:", error);
      throw error;
    } finally {
      // Reset prompt so subsequent logins don't always force consent
      googleProvider.setCustomParameters({ prompt: "select_account" });
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("googleToken");
      }
      await signOut(auth);
    } catch (error) {
      console.error("Sign out failed", error);
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout, reauthorize }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
