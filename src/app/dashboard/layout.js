import React from "react";
import Sidebar from "../../components/layout/Sidebar";
import AuroraEffect from "../../components/effects/AuroraEffect";
import ParticleField from "../../components/effects/ParticleField";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen relative flex">
      {/* Background Visual Effects */}
      <AuroraEffect active={false} />
      <ParticleField />

      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 min-h-screen pl-64 flex flex-col">
        {/* Children contains the dashboard page and its header */}
        <main className="flex-1 w-full flex flex-col pt-20">
          {children}
        </main>
      </div>
    </div>
  );
}
