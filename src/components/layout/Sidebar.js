"use client";

import React from "react";
import { 
  LayoutDashboard, 
  Calendar, 
  Mail, 
  ShieldAlert, 
  Settings, 
  BrainCircuit,
  LogOut
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const menuItems = [
    { name: "Nexus Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Execution Plan", icon: BrainCircuit, path: "/dashboard/execution-plan" },
    { name: "Calendar Hub", icon: Calendar, path: "/dashboard/calendar-hub" },
    { name: "Comms & Drafts", icon: Mail, path: "/dashboard/comms-drafts" },
    { name: "Burnout Radar", icon: ShieldAlert, path: "/dashboard/burnout-radar" },
  ];

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 glass-panel border-r border-[#8b5cf6]/10 flex flex-col justify-between py-6 px-4 z-10">
      <div className="space-y-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-2">
          <div className="h-9 w-9 rounded-lg bg-[radial-gradient(circle_at_top_left,#8b5cf6,#06b6d4)] flex items-center justify-center shadow-lg shadow-[#8b5cf6]/25 animate-pulse">
            <span className="text-black font-extrabold text-lg">S</span>
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-wider text-white">SYNTROPY</h1>
            <span className="text-[10px] font-mono tracking-widest text-[#06b6d4] block -mt-1">
              SYSTEM OF AGENCY
            </span>
          </div>
        </div>

        {/* Menu Navigation */}
        <nav className="space-y-1">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            
            return (
              <Link 
                key={index} 
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive 
                    ? "bg-[#8b5cf6]/15 text-white border-l-2 border-[#8b5cf6] shadow-sm shadow-[#8b5cf6]/5" 
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                }`}
              >
                <Icon size={18} className={isActive ? "text-[#8b5cf6]" : "text-zinc-500"} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / System Status */}
      <div className="space-y-4 px-2">
        <div className="p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/40 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
            <span>AI ENGINE</span>
            <span className="text-emerald-500 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              ACTIVE
            </span>
          </div>
          <div className="text-[10px] text-zinc-400 font-sans leading-relaxed">
            Gemini 1.5 Pro context window: 92.4% free.
          </div>
        </div>

        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-zinc-500 hover:text-red-400 hover:bg-red-500/5 transition-all duration-300 cursor-pointer"
        >
          <LogOut size={16} />
          Disconnect
        </button>
      </div>
    </aside>
  );
}
