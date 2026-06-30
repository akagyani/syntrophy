"use client";

import React from "react";
import { 
  Bell, 
  Search, 
  Activity, 
  Moon,
  Sparkles
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

export default function Header({ isAIPerforming = false, aiStatusText = "", onProfileClick }) {
  const { user } = useAuth();

  const displayName = user ? user.displayName : "User";
  const photoURL = user ? user.photoURL : null;
  const initials = displayName
    ? displayName.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()
    : "AM";

  const defaultSleepData = { score: 72, status: "Compromised" };
  const defaultBurnoutIndex = 84;
  return (
    <header className="h-20 w-[calc(100%-16rem)] fixed right-0 top-0 border-b border-[#8b5cf6]/5 px-8 flex items-center justify-between bg-zinc-950/20 backdrop-blur-md z-10">
      
      {/* Search / AI Status Context */}
      <div className="flex items-center gap-4 w-96">
        {isAIPerforming ? (
          <div className="flex items-center gap-2 text-xs font-mono text-[#06b6d4]">
            <Sparkles size={14} className="animate-spin text-[#8b5cf6]" />
            <span className="animate-pulse">{aiStatusText || "Anticipating next workflow..."}</span>
          </div>
        ) : (
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 text-zinc-500" size={16} />
            <input 
              type="text" 
              placeholder="Ask Syntropy to negotiate, prep, or automate..."
              className="w-full bg-zinc-900/40 border border-zinc-800/60 rounded-full py-2 pl-10 pr-4 text-xs text-zinc-300 placeholder-zinc-500 focus:outline-none focus:border-[#8b5cf6]/40 transition-colors"
            />
          </div>
        )}
      </div>

      {/* User Stats & Oura Integration */}
      <div className="flex items-center gap-6">
        {/* Oura Sleep Score Indicator */}
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-indigo-950/20 border border-indigo-900/20">
          <Moon size={14} className="text-[#8b5cf6]" />
          <div className="text-left leading-none">
            <span className="text-[10px] text-zinc-500 font-mono block">OURA SLEEP</span>
            <span className="text-xs font-semibold text-zinc-200">
              {defaultSleepData.score}/100 ({defaultSleepData.status})
            </span>
          </div>
        </div>

        {/* Burnout Meter */}
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-rose-950/20 border border-rose-900/20">
          <Activity size={14} className="text-rose-500 animate-pulse" />
          <div className="text-left leading-none">
            <span className="text-[10px] text-zinc-500 font-mono block">BURNOUT INDEX</span>
            <span className="text-xs font-bold text-rose-400">
              {defaultBurnoutIndex}% (High Alert)
            </span>
          </div>
        </div>

        {/* Separator */}
        <div className="h-6 w-[1px] bg-zinc-800" />

        {/* Notification Bell */}
        <button className="h-9 w-9 rounded-full bg-zinc-900/60 border border-zinc-800/40 flex items-center justify-center hover:bg-zinc-800/60 transition-colors text-zinc-400 hover:text-zinc-200 relative">
          <Bell size={16} />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#06b6d4] shadow-sm shadow-[#06b6d4]/50" />
        </button>

        {/* User Profile */}
        <div 
          onClick={onProfileClick}
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="text-right leading-none hidden sm:block">
            <span className="text-xs font-medium text-white block">{displayName}</span>
            <span className="text-[9px] font-mono text-zinc-500">Power User</span>
          </div>
          {photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={photoURL} 
              alt={displayName} 
              className="h-9 w-9 rounded-full border-2 border-zinc-800 object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-[#8b5cf6] to-[#06b6d4] flex items-center justify-center text-black font-bold text-sm border-2 border-zinc-850">
              {initials}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
