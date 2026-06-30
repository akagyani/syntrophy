"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import Header from "../../components/layout/Header";
import Timeline from "../../components/dashboard/Timeline";
import BurnoutRadar from "../../components/dashboard/BurnoutRadar";
import MorningBriefing from "../../components/dashboard/MorningBriefing";
import AnticipationEngine from "../../components/dashboard/AnticipationEngine";
import NegotiationPanel from "../../components/dashboard/NegotiationPanel";
import AddTaskModal from "../../components/dashboard/AddTaskModal";
import ProfileSettingsModal from "../../components/dashboard/ProfileSettingsModal";
import ContextCaptureModal from "../../components/dashboard/ContextCaptureModal";
import { createGoogleDoc, createGmailDraft } from "../../lib/workspace";
import { db } from "../../lib/firebase";
import { collection, doc, setDoc, onSnapshot, deleteDoc, arrayUnion } from "firebase/firestore";
import { requestNotificationPermission, listenForForegroundMessages } from "../../lib/notifications";
import { Sparkles, Brain, Clock, ShieldAlert, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [activePrepTaskId, setActivePrepTaskId] = useState(null);
  const [activeNegotiateTaskId, setActiveNegotiateTaskId] = useState(null);
  const [isAIPerforming, setIsAIPerforming] = useState(false);
  const [aiStatusText, setAiStatusText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [contextModalTask, setContextModalTask] = useState(null);
  const [contextRecipient, setContextRecipient] = useState(null);
  const [contextTone, setContextTone] = useState("formal");

  const activePrepTask = tasks.find(t => t.id === activePrepTaskId);
  const activeNegotiateTask = tasks.find(t => t.id === activeNegotiateTaskId);

  const { user, loading, reauthorize } = useAuth();
  const router = useRouter();

  // Redirect Guard
  useEffect(() => {
    if (!user && !loading) {
      router.push("/");
    }
  }, [user, loading, router]);

  // FCM Setup
  useEffect(() => {
    if (!user) return;

    const setupFCM = async () => {
      const token = await requestNotificationPermission();
      if (token) {
        // Save token to user document
        try {
          await setDoc(doc(db, "users", user.uid), {
            fcmTokens: arrayUnion(token)
          }, { merge: true });
        } catch (err) {
          console.error("Failed to save FCM token:", err);
        }
      }

      listenForForegroundMessages((payload) => {
        // Display toast when a push arrives while app is open
        setToast({
          message: payload.notification?.title || "New AI insight available",
          type: "success"
        });
        setTimeout(() => setToast(null), 5000);
      });
    };

    setupFCM();
  }, [user]);

  // Firestore Real-Time Sync Subscription
  useEffect(() => {
    if (!user) return;

    const tasksRef = collection(db, "users", user.uid, "tasks");
    const unsubscribe = onSnapshot(tasksRef, (snapshot) => {
      const dbTasks = [];
      snapshot.forEach((doc) => {
        dbTasks.push(doc.data());
      });
      if (dbTasks.length > 0) {
        // Sort tasks by timeRaw or title
        setTasks(dbTasks);
      }
    });

    return () => unsubscribe();
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-zinc-400 font-mono text-xs gap-3 w-full fixed inset-0 z-50">
        <div className="h-4 w-4 border-2 border-[#8b5cf6] border-t-transparent rounded-full animate-spin" />
        <span>Authenticating with Syntropy...</span>
      </div>
    );
  }

  const handleStartPrep = async (id) => {
    if (!id) return;
    // Set task to preparing
    setTasks(prevTasks =>
      prevTasks.map(t => (t.id === id ? { ...t, status: "preparing" } : t))
    );
    
    setActivePrepTaskId(id);
    setActiveNegotiateTaskId(null);
    setIsAIPerforming(true);
    setAiStatusText("Ingesting files & emails...");

    setTimeout(() => setAiStatusText("Analyzing codebase..."), 1500);
    setTimeout(() => setAiStatusText("Generating pre-work updates..."), 3200);

    setTimeout(async () => {
      setTasks(prevTasks =>
        prevTasks.map(t => (t.id === id ? { ...t, status: "prepared" } : t))
      );
      
      // Update in Firestore
      if (user) {
        try {
          await setDoc(doc(db, "users", user.uid, "tasks", id), { 
            status: "prepared" 
          }, { merge: true });
        } catch (e) {
          console.error(e);
        }
      }
      setIsAIPerforming(false);
      setAiStatusText("");
    }, 4800);
  };

  const handleNegotiate = async (id) => {
    if (!id) return;
    // Set task to negotiating
    setTasks(prevTasks =>
      prevTasks.map(t => (t.id === id ? { ...t, status: "negotiating" } : t))
    );

    setActiveNegotiateTaskId(id);
    setActivePrepTaskId(null);
    setIsAIPerforming(true);
    setAiStatusText("Calculating schedule densities...");

    setTimeout(() => setAiStatusText("Drafting extension request..."), 1200);
    setTimeout(() => setAiStatusText("Optimizing negotiation parameters..."), 2400);

    setTimeout(async () => {
      setTasks(prevTasks =>
        prevTasks.map(t => (t.id === id ? { ...t, status: "negotiated" } : t))
      );
      
      // Update in Firestore
      if (user) {
        try {
          await setDoc(doc(db, "users", user.uid, "tasks", id), { 
            status: "negotiated" 
          }, { merge: true });
        } catch (e) {
          console.error(e);
        }
      }
      setIsAIPerforming(false);
      setAiStatusText("");
    }, 3600);
  };

  const handleApproveAction = async (id) => {
    if (!id) return;
    setTasks(prevTasks =>
      prevTasks.map(t => (t.id === id ? { ...t, approved: true } : t))
    );
    if (user && !user.isMock) {
      try {
        await setDoc(doc(db, "users", user.uid, "tasks", id), { 
          approved: true 
        }, { merge: true });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleCompletePrep = async (id, tokenOverride = null, isRetry = false) => {
    if (!id) return;
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    try {
      // Trigger Docs API call
      const token = tokenOverride || user?.accessToken;
      const res = await createGoogleDoc(token, task.title, task.prepContent);
      
      setTasks(prevTasks =>
        prevTasks.map(t => (t.id === id ? { ...t, approved: true, docUrl: res.url } : t))
      );
      
      if (user) {
        await setDoc(doc(db, "users", user.uid, "tasks", id), { 
          approved: true, 
          docUrl: res.url 
        }, { merge: true });
      }
    } catch (err) {
      if ((err.name === "TokenExpiredError" || err.name === "ScopeError") && !isRetry) {
        try {
          const freshToken = await reauthorize();
          await handleCompletePrep(id, freshToken, true);
          return;
        } catch (reAuthErr) {
          console.error("Re-authorization failed", reAuthErr);
        }
      }
      console.error("Failed to sync to Google Docs, falling back", err);
      handleApproveAction(id);
    }
  };

  const handleCompleteNegotiation = async (id, toEmail, tokenOverride = null, isRetry = false) => {
    if (!id) return;
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    try {
      const token = tokenOverride || user?.accessToken;
      const to = toEmail || "prof.hargrove@university.edu";
      const subject = `Extension Request: ${task.title}`;
      const body = task.prepContent;
      
      // Trigger Gmail API call
      const res = await createGmailDraft(token, to, subject, body);
      
      setTasks(prevTasks =>
        prevTasks.map(t => (t.id === id ? { ...t, approved: true, gmailDraftId: res.draftId } : t))
      );
      
      if (user) {
        await setDoc(doc(db, "users", user.uid, "tasks", id), { 
          approved: true, 
          gmailDraftId: res.draftId 
        }, { merge: true });
      }
    } catch (err) {
      if ((err.name === "TokenExpiredError" || err.name === "ScopeError") && !isRetry) {
        try {
          const freshToken = await reauthorize();
          await handleCompleteNegotiation(id, toEmail, freshToken, true);
          return;
        } catch (reAuthErr) {
          console.error("Re-authorization failed", reAuthErr);
        }
      }
      console.error("Failed to create Gmail draft, falling back", err);
      handleApproveAction(id);
    }
  };


  const handleApproveBriefingAction = (id, approved) => {
    if (id === "action-1" && approved) {
      // Sarah 1:1 reschedule approved
    } else if (id === "action-2" && approved) {
      handleStartPrep("task-2");
    }
  };

  const handleAddTask = async (newTask) => {
    setTasks(prev => [...prev, newTask]);
    
    if (user && !user.isMock) {
      try {
        await setDoc(doc(db, "users", user.uid, "tasks", newTask.id), newTask);
      } catch (err) {
        console.error("Firestore task creation failed", err);
      }
    }
  };

  const handleDeleteTask = async (id) => {
    if (!id) return;
    
    if (toast) {
      clearTimeout(toast.timer);
    }

    const deletedTask = tasks.find(t => t.id === id);
    if (!deletedTask) return;

    // Optimistic UI update
    setTasks(prev => prev.filter(t => t.id !== id));

    if (activePrepTaskId === id) setActivePrepTaskId(null);
    if (activeNegotiateTaskId === id) setActiveNegotiateTaskId(null);

    const timer = setTimeout(async () => {
      if (user) {
        try {
          await deleteDoc(doc(db, "users", user.uid, "tasks", id));
        } catch (err) {
          console.error("Firestore deletion failed", err);
        }
      }
      setToast(null);
    }, 5000);

    setToast({
      task: deletedTask,
      timer
    });
  };

  const handleUndoDelete = () => {
    if (!toast) return;
    clearTimeout(toast.timer);
    
    setTasks(prev => {
      if (prev.some(t => t.id === toast.task.id)) return prev;
      return [...prev, toast.task];
    });

    setToast(null);
  };

  return (
    <>
      <Header 
        isAIPerforming={isAIPerforming} 
        aiStatusText={aiStatusText} 
        onProfileClick={() => setIsProfileOpen(true)}
      />
      
      <div className="flex-1 p-8 overflow-y-auto w-full grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Main Left Columns: Timeline & Morning Briefing (2/3 width) */}
        <div className="xl:col-span-2 space-y-8">
          {/* Welcome banner */}
          <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/40 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <Brain className="text-[#8b5cf6]" size={20} />
                Welcome to Syntropy Nexus
              </h1>
              <p className="text-xs text-zinc-400">
                AI has analyzed your sleep recovery and calendar density. Action items ready.
              </p>
            </div>
            <div className="flex gap-2">
              <div className="px-3 py-1 bg-zinc-950/80 border border-zinc-800 rounded-xl text-center">
                <span className="text-[9px] text-zinc-500 font-mono block">OURA STATUS</span>
                <span className="text-xs font-bold text-[#8b5cf6]">DEPRIVED</span>
              </div>
              <div className="px-3 py-1 bg-zinc-950/80 border border-zinc-800 rounded-xl text-center">
                <span className="text-[9px] text-zinc-500 font-mono block">BURNOUT INDEX</span>
                <span className="text-xs font-bold text-rose-400">78%</span>
              </div>
            </div>
          </div>

          {/* Morning voice briefing agent */}
          <MorningBriefing onApproveBriefingAction={handleApproveBriefingAction} />

          {/* Core Heartbeat Timeline */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-300 tracking-wider uppercase font-mono flex items-center gap-2">
                <Clock size={14} className="text-[#06b6d4]" />
                Daily Execution Timeline
              </h2>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="px-3 py-1 rounded-lg bg-[#8b5cf6]/10 text-[#a78bfa] border border-[#8b5cf6]/20 hover:bg-[#8b5cf6]/20 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Plus size={12} /> Add Commitment
              </button>
            </div>

            <Timeline 
              tasks={tasks} 
              onStartPrep={handleStartPrep} 
              onNegotiate={handleNegotiate}
              onApproveAction={handleApproveAction}
              onDeleteTask={handleDeleteTask}
              onAddContext={(task) => setContextModalTask(task)}
            />
          </div>
        </div>

        {/* Right Sidebar Columns: Radar & Active AI Engine (1/3 width) */}
        <div className="space-y-8">
          {/* Burnout stress index */}
          <BurnoutRadar />

          {/* Active AI Anticipation / Negotiation Console */}
          <div className="xl:sticky xl:top-28 h-[470px]">
            {activePrepTask ? (
              <AnticipationEngine 
                key={activePrepTask.id}
                activeTask={activePrepTask} 
                onCompletePrep={handleCompletePrep} 
                onCompleteNegotiation={handleCompleteNegotiation}
                contextRecipient={contextRecipient}
                user={user}
              />
            ) : activeNegotiateTask ? (
              <NegotiationPanel 
                key={activeNegotiateTask.id}
                activeTask={activeNegotiateTask} 
                onCompletePrep={handleCompletePrep}
                onCompleteNegotiation={handleCompleteNegotiation}
              />
            ) : (
              <div className="glass-panel rounded-2xl p-6 border border-zinc-800/60 h-full flex flex-col items-center justify-center text-center">
                <Sparkles size={32} className="text-zinc-700 mb-3 animate-pulse" />
                <h4 className="text-sm font-semibold text-zinc-500">Autonomous Core Idle</h4>
                <p className="text-xs text-zinc-500 max-w-xs mt-1">
                  Syntropy is monitoring calendar events. Trigger a task&apos;s pre-work or negotiate timelines to engage the AI agents.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      <AddTaskModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddTask={handleAddTask}
      />

      <ProfileSettingsModal 
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
      />

      <ContextCaptureModal
        task={contextModalTask}
        isOpen={!!contextModalTask}
        onClose={() => setContextModalTask(null)}
        onSave={(enrichedTask, recipient, tone) => {
          setContextRecipient(recipient);
          setContextTone(tone);
          // Update task in local state with enriched context
          setTasks(prev => prev.map(t => t.id === enrichedTask.id ? enrichedTask : t));
          setContextModalTask(null);
          // Auto-trigger prep panel for this task
          setActivePrepTaskId(enrichedTask.id);
          setActiveNegotiateTaskId(null);
        }}
      />

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3.5 bg-zinc-950/80 border border-zinc-800 backdrop-blur-md rounded-2xl flex items-center gap-6 shadow-[0_10px_35px_rgba(0,0,0,0.6)] border-[#8b5cf6]/20 font-sans"
          >
            <span className="text-xs text-zinc-300 font-semibold font-sans">Commitment removed from timeline</span>
            <button
              onClick={handleUndoDelete}
              className="px-3 py-1 bg-[#8b5cf6] text-black font-bold text-[10px] rounded-lg hover:opacity-90 transition-opacity cursor-pointer font-sans"
            >
              Undo
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
