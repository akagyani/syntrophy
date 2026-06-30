"use client";

import React from "react";
import TaskCard from "./TaskCard";

export default function Timeline({ tasks, onStartPrep, onNegotiate, onApproveAction, onDeleteTask, onAddContext }) {
  return (
    <div className="space-y-6 relative pl-8">
      {/* Timeline line */}
      <div className="absolute left-3 top-2 bottom-2 w-[2px] bg-gradient-to-b from-[#8b5cf6]/20 via-[#06b6d4]/10 to-transparent" />
      
      {/* Heartbeat pulse animation along timeline */}
      <div className="absolute left-[11px] top-6 w-[6px] h-32 bg-gradient-to-b from-[#8b5cf6] to-transparent blur-[1px] animate-heartbeat rounded-full" />

      {tasks.map((task, index) => {
        const timeParts = (task?.time || "").split(" ");
        const timeFirst = timeParts[0] || "";
        const timeSecond = timeParts[1] || "";
        const taskId = task?.id || `task-key-${index}`;

        return (
          <div key={taskId} className="relative group">
            {/* Timeline node */}
            <div className={`absolute -left-[27px] top-[22px] h-[10px] w-[10px] rounded-full border-2 bg-[#050505] transition-all duration-300 z-10 ${
              task.risk === "critical"
                ? "border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]"
                : task.risk === "high"
                ? "border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.6)]"
                : "border-[#06b6d4] shadow-[0_0_10px_rgba(6,182,212,0.6)]"
            }`} />

            {/* Time indicator */}
            <div className="absolute -left-28 top-[18px] text-[10px] font-mono text-zinc-500 w-20 text-right select-none">
              {timeFirst} {timeSecond}
            </div>

            <TaskCard 
              task={task} 
              onStartPrep={onStartPrep} 
              onNegotiate={onNegotiate}
              onApproveAction={onApproveAction}
              onDelete={onDeleteTask}
              onAddContext={onAddContext}
            />
          </div>
        );
      })}
    </div>
  );
}
