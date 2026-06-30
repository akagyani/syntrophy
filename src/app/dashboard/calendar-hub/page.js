"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import Header from "../../../components/layout/Header";
import { Calendar as CalendarIcon, Clock, Sparkles, Check, ChevronLeft, ChevronRight, ShieldAlert, RefreshCw, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../../../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { fetchGoogleCalendarEvents } from "../../../lib/workspace";

export default function CalendarHubPage() {
  const { user, loading, reauthorize } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [calEvents, setCalEvents] = useState([]);
  const [isLoadingCal, setIsLoadingCal] = useState(true);
  const [calError, setCalError] = useState(null);
  const [isScopeError, setIsScopeError] = useState(false);
  const [reAuthFailed, setReAuthFailed] = useState(false);
  const [isReauthorizing, setIsReauthorizing] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);

  // Redirect Guard
  useEffect(() => {
    if (!user && !loading) {
      router.push("/");
    }
  }, [user, loading, router]);

  // Firestore Real-Time Sync Subscription for tasks
  useEffect(() => {
    if (!user) return;

    const tasksRef = collection(db, "users", user.uid, "tasks");
    const unsubscribe = onSnapshot(tasksRef, (snapshot) => {
      const dbTasks = [];
      snapshot.forEach((doc) => dbTasks.push(doc.data()));
      if (dbTasks.length > 0) {
        setTasks(dbTasks);
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Load real Google Calendar events
  const loadCalendarEvents = async (tokenOverride, isRetry = false) => {
    if (!user) return;
    setIsLoadingCal(true);
    setCalError(null);
    setIsScopeError(false);
    setReAuthFailed(false);
    try {
      const token = tokenOverride || user.accessToken;
      const events = await fetchGoogleCalendarEvents(token);
      setCalEvents(events);
      setLastSynced(new Date().toLocaleTimeString());
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        // Do NOT silently reauthorize here, as it will trigger popup-blockers if called from useEffect.
        // Instead, show the Scope/Auth error banner to let the user manually click to reauthorize.
        setCalError("Google OAuth token expired. Please click below to re-authorize.");
        setIsScopeError(true);
      } else if (err.name === "ScopeError") {
        setIsScopeError(true);
        setCalError(null);
      } else {
        setCalError("Calendar sync failed. Check API permissions.");
        console.error("Calendar fetch error:", err);
      }
    } finally {
      setIsLoadingCal(false);
    }
  };


  // Handle re-authorization + retry
  const handleReauthorize = async () => {
    setIsReauthorizing(true);
    setReAuthFailed(false);
    try {
      const freshToken = await reauthorize();
      await loadCalendarEvents(freshToken);
    } catch (err) {
      // Popup failed or scope still denied → guide user to GCP setup
      setReAuthFailed(true);
      setIsScopeError(true);
      console.warn("Re-auth failed:", err.message);
    } finally {
      setIsReauthorizing(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadCalendarEvents();
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-zinc-400 font-mono text-xs gap-3 w-full fixed inset-0 z-50">
        <div className="h-4 w-4 border-2 border-[#8b5cf6] border-t-transparent rounded-full animate-spin" />
        <span>Authenticating with Syntropy...</span>
      </div>
    );
  }

  // Hours layout (8 AM - 6 PM)
  const hours = [
    { label: "08:00 AM", h: "8" },
    { label: "09:00 AM", h: "9" },
    { label: "10:00 AM", h: "10" },
    { label: "11:00 AM", h: "11" },
    { label: "12:00 PM", h: "12" },
    { label: "01:00 PM", h: "13" },
    { label: "02:00 PM", h: "14" },
    { label: "03:00 PM", h: "15" },
    { label: "04:00 PM", h: "16" },
    { label: "05:00 PM", h: "17" },
    { label: "06:00 PM", h: "18" }
  ];

  // Helper: parse event hour
  const getEventHour = (dateStr) => {
    if (!dateStr) return -1;
    const d = new Date(dateStr);
    return isNaN(d) ? -1 : d.getHours();
  };

  // Helper: format event time
  const formatEventTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d)) return "";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Color map for calendar events
  const colorMap = {
    cyan: "bg-[#06b6d4]/10 border-[#06b6d4]/30 text-[#06b6d4]",
    violet: "bg-[#8b5cf6]/10 border-[#8b5cf6]/30 text-[#a78bfa]",
    amber: "bg-amber-500/10 border-amber-500/30 text-amber-400",
    red: "bg-red-500/10 border-red-500/30 text-red-400",
    emerald: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    orange: "bg-orange-500/10 border-orange-500/30 text-orange-400",
    rose: "bg-rose-500/10 border-rose-500/30 text-rose-400",
    indigo: "bg-indigo-500/10 border-indigo-500/30 text-indigo-400",
    zinc: "bg-zinc-700/20 border-zinc-600/30 text-zinc-400"
  };

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <>
      <Header isAIPerforming={isLoadingCal} aiStatusText={isLoadingCal ? "Fetching Google Calendar..." : ""} />
      
      <div className="flex-1 p-8 overflow-y-auto w-full space-y-6">
        
        {/* Title Banner */}
        <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/40 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <CalendarIcon className="text-[#8b5cf6]" size={20} />
              Calendar Integration Hub
            </h1>
            <p className="text-xs text-zinc-400">
              Synchronizing live Google Calendar events, predicting load density, and auto-negotiating event structures.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {lastSynced && (
              <span className="text-[10px] text-zinc-500 font-mono">Last synced: {lastSynced}</span>
            )}
            <button
              onClick={loadCalendarEvents}
              disabled={isLoadingCal}
              className="flex items-center gap-1.5 text-xs font-mono text-[#06b6d4] bg-[#06b6d4]/5 px-3 py-1.5 rounded-xl border border-[#06b6d4]/10 hover:bg-[#06b6d4]/10 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={12} className={isLoadingCal ? "animate-spin" : ""} />
              {isLoadingCal ? "Syncing..." : "Sync Calendar"}
            </button>
          </div>
        </div>

        {/* Scope Permission / Setup Guide Banner */}
        <AnimatePresence>
          {isScopeError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-2xl border border-amber-500/20 bg-amber-500/5 overflow-hidden"
            >
              {/* Banner Header */}
              <div className="flex items-center justify-between p-4 border-b border-amber-500/10">
                <div className="flex items-center gap-2">
                  <ShieldAlert size={16} className="text-amber-400" />
                  <p className="text-sm font-semibold text-amber-300">
                    {reAuthFailed ? "Google Calendar API Not Enabled" : "Google Calendar Permission Required"}
                  </p>
                </div>

              </div>

              {/* Steps */}
              <div className="p-4 space-y-4">
                {reAuthFailed ? (
                  // GCP setup steps shown after reauth still fails
                  <div className="space-y-3">
                    <p className="text-xs text-amber-400/80 leading-relaxed">
                      Re-authorization succeeded but the Calendar API is not yet enabled in your Google Cloud project.
                      Complete these one-time steps, then click <strong className="text-amber-300">Retry</strong>.
                    </p>
                    <ol className="space-y-2 text-xs text-zinc-300">
                      <li className="flex items-start gap-2">
                        <span className="shrink-0 h-5 w-5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold flex items-center justify-center">1</span>
                        <span>
                          Open{" "}
                          <a
                            href="https://console.cloud.google.com/apis/library/calendar-json.googleapis.com"
                            target="_blank" rel="noopener noreferrer"
                            className="text-[#06b6d4] hover:underline"
                          >
                            Google Cloud Console → APIs → Calendar API
                          </a>{" "}
                          and click <strong>Enable</strong>.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="shrink-0 h-5 w-5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold flex items-center justify-center">2</span>
                        <span>
                          Go to{" "}
                          <a
                            href="https://console.cloud.google.com/apis/credentials/consent"
                            target="_blank" rel="noopener noreferrer"
                            className="text-[#06b6d4] hover:underline"
                          >
                            OAuth Consent Screen → Scopes
                          </a>,
                          add <code className="text-[10px] bg-zinc-900 px-1 py-0.5 rounded font-mono text-emerald-400">.../auth/calendar.readonly</code> and save.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="shrink-0 h-5 w-5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold flex items-center justify-center">3</span>
                        <span>Come back here and click <strong>Retry Authorization</strong> below.</span>
                      </li>
                    </ol>
                  </div>
                ) : (
                  // Simple re-auth prompt shown first time
                  <p className="text-xs text-amber-400/80 leading-relaxed">
                    Your current session token doesn&apos;t include Google Calendar permission.
                    Click <strong className="text-amber-300">Grant Access</strong> — a Google popup will open and your token will refresh automatically.
                    If it still fails, the Calendar API may need to be enabled in your GCP project (we&apos;ll guide you).
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={handleReauthorize}
                    disabled={isReauthorizing}
                    className="flex items-center gap-2 text-xs font-semibold text-zinc-900 bg-amber-400 hover:bg-amber-300 px-4 py-2 rounded-xl transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {isReauthorizing ? (
                      <><RefreshCw size={12} className="animate-spin" /> Authorizing...</>
                    ) : reAuthFailed ? (
                      <><RefreshCw size={12} /> Retry Authorization</>
                    ) : (
                      <><CalendarIcon size={12} /> Grant Calendar Access</>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Calendar generic Error Banner */}
        {calError && (
          <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-amber-400 text-xs flex items-center gap-2">
            <ShieldAlert size={14} />
            {calError}
          </div>
        )}

        {/* Calendar Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Grid View */}
          <div className="lg:col-span-3 glass-panel border border-zinc-800/60 rounded-3xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">{today}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#8b5cf6]" />
                <span className="text-[9px] text-zinc-500 font-mono">SYNTROPY TASKS</span>
                <span className="h-2.5 w-2.5 rounded-full bg-[#06b6d4] ml-3" />
                <span className="text-[9px] text-zinc-500 font-mono">GOOGLE CALENDAR</span>
              </div>
            </div>

            {/* Time Grid Layout */}
            <div className="relative border border-zinc-900 rounded-2xl overflow-hidden bg-zinc-950/20">
              <div className="divide-y divide-zinc-900/60">
                {hours.map(({ label, h }, idx) => {
                  // Syntropy tasks matching this hour
                  const matchedTasks = tasks.filter(t => t?.time && t.time.includes(h === "12" ? "12" : h.padStart(2, "0")));
                  
                  // Google Calendar events matching this hour
                  const matchedCalEvents = calEvents.filter(e => {
                    const eventHour = getEventHour(e.start);
                    return eventHour === parseInt(h);
                  });

                  const hasItems = matchedTasks.length > 0 || matchedCalEvents.length > 0;
                  
                  return (
                    <div key={idx} className={`flex min-h-[72px] relative transition-colors ${hasItems ? "bg-zinc-950/30" : "hover:bg-zinc-950/10"}`}>
                      {/* Left Hour indicator */}
                      <div className="w-28 text-[10px] font-mono text-zinc-500 p-4 text-right border-r border-zinc-900 select-none bg-zinc-950/40 flex-shrink-0">
                        {label}
                      </div>

                      {/* Right Slot Container */}
                      <div className="flex-1 p-3 flex gap-2 flex-wrap items-start">
                        {/* Syntropy Tasks */}
                        {matchedTasks.map((task) => (
                          <motion.div
                            key={task.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`px-3 py-1.5 rounded-xl border text-[11px] font-sans flex flex-col justify-center space-y-0.5 shadow-sm max-w-[200px] ${
                              task.risk === "critical"
                                ? "bg-red-500/10 border-red-500/30 text-red-400"
                                : task.risk === "high"
                                ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                                : "bg-[#8b5cf6]/10 border-[#8b5cf6]/30 text-[#a78bfa]"
                            }`}
                          >
                            <span className="font-bold flex items-center gap-1.5 truncate">
                              {task.title}
                              {task.approved && <Check size={10} className="text-emerald-500 shrink-0" />}
                            </span>
                            <span className="text-[9px] font-mono opacity-80">{task.time} · {task.category}</span>
                          </motion.div>
                        ))}

                        {/* Google Calendar Events */}
                        {isLoadingCal && idx === 0 && (
                          <div className="text-[10px] text-zinc-500 font-mono flex items-center gap-1.5">
                            <RefreshCw size={10} className="animate-spin" />
                            Loading Google Calendar...
                          </div>
                        )}
                        {!isLoadingCal && matchedCalEvents.map((event) => (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`px-3 py-1.5 rounded-xl border text-[11px] font-sans flex flex-col justify-center space-y-0.5 shadow-sm max-w-[200px] ${colorMap[event.color] || colorMap.cyan}`}
                          >
                            <span className="font-bold truncate flex items-center gap-1">
                              <CalendarIcon size={9} className="shrink-0 opacity-60" />
                              {event.title}
                            </span>
                            <span className="text-[9px] font-mono opacity-80">
                              {formatEventTime(event.start)}{event.end ? ` → ${formatEventTime(event.end)}` : ""}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar Insights Panel */}
          <div className="space-y-6">
            
            {/* Live Google Calendar Events List */}
            <div className="glass-panel border border-zinc-800/60 rounded-3xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-white font-mono tracking-wider uppercase flex items-center gap-1.5">
                <CalendarIcon size={14} className="text-[#06b6d4]" />
                Today from Google Calendar
                {isLoadingCal && <RefreshCw size={10} className="animate-spin text-zinc-500 ml-auto" />}
              </h3>
              
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {calEvents.length === 0 && !isLoadingCal ? (
                  <p className="text-[10px] text-zinc-500 font-mono">No events fetched or calendar is empty today.</p>
                ) : (
                  calEvents.map((event) => (
                    <div 
                      key={event.id}
                      className={`p-2.5 rounded-xl border text-[10px] font-sans space-y-0.5 ${colorMap[event.color] || colorMap.cyan}`}
                    >
                      <span className="font-bold block truncate">{event.title}</span>
                      <span className="font-mono opacity-70 block">
                        {formatEventTime(event.start)}{event.end ? ` - ${formatEventTime(event.end)}` : ""}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Oura Sync Metrics */}
            <div className="glass-panel border border-zinc-800/60 rounded-3xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-white font-mono tracking-wider uppercase flex items-center gap-1.5">
                <ShieldAlert size={14} className="text-rose-400" />
                Workload Audit
              </h3>
              
              <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Sleep Recovery</span>
                  <span className="text-[#8b5cf6] font-bold">52/100</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Load Index</span>
                  <span className="text-rose-400 font-bold">78% (At Risk)</span>
                </div>
                <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                  <div className="h-full w-[78%] bg-rose-500 transition-all" />
                </div>
              </div>

              <p className="text-[10px] text-zinc-500 leading-normal">
                Syntropy has autonomously pushed the Sarah 1:1 meeting to tomorrow to balance your recovery constraints.
              </p>
            </div>

            {/* Calendar Integrations list */}
            <div className="glass-panel border border-zinc-800/60 rounded-3xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-white font-mono tracking-wider uppercase">
                Active Calendars
              </h3>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-[#8b5cf6] bg-zinc-950 border-zinc-850" />
                  <span className="flex items-center gap-1.5">Google Calendar <span className="text-[9px] text-emerald-500 font-mono">(Live)</span></span>
                </label>
                <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-[#8b5cf6] bg-zinc-950 border-zinc-850" />
                  Gmail Ingest Agent
                </label>
                <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
                  <input type="checkbox" className="rounded text-[#8b5cf6] bg-zinc-950 border-zinc-850" />
                  Outlook (University Portal)
                </label>
              </div>
            </div>

          </div>

        </div>

      </div>
    </>
  );
}
