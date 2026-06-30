"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Syntropy Error Boundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-zinc-300 font-mono">
          <div className="max-w-md w-full bg-[#0a0a0a] border border-[#222] shadow-[inset_0_2px_15px_rgba(0,0,0,0.8)] rounded-xl p-8 space-y-6">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle size={24} />
              <h2 className="text-lg font-bold font-sans">System Fault Detected</h2>
            </div>
            
            <p className="text-xs leading-relaxed text-[#a1a1aa]">
              A fatal error occurred in the React component tree. Our engineers have been notified.
            </p>

            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-[10px] text-red-300 overflow-x-auto whitespace-pre-wrap">
              {this.state.error?.toString()}
            </div>

            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#111] hover:bg-[#1a1a1a] border border-[#333] hover:border-[#444] rounded-lg transition-colors cursor-pointer text-xs font-bold text-white"
            >
              <RefreshCw size={14} />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
