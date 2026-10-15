"use client";

import { useState, useEffect } from "react";
import { Leaf, Wifi, Clock, Activity, PauseCircle, PlayCircle } from "lucide-react";

interface HeaderProps {
  lastUpdated: Date;
  isLive: boolean;
  onToggleLive: () => void;
}

export default function Header({ lastUpdated, isLive, onToggleLive }: HeaderProps) {
  const [timeStr, setTimeStr] = useState("--:--:-- --");

  useEffect(() => {
    setTimeStr(
      lastUpdated.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    );
  }, [lastUpdated]);

  return (
    <header className="sticky top-0 z-50 border-b border-green-900/40 bg-[#0a150a]/90 backdrop-blur-md">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-lime-500 flex items-center justify-center shadow-lg shadow-green-900/50">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400 border-2 border-[#0a150a] animate-pulse" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight leading-none">
                Smart Compost Bin
              </h1>
              <p className="text-[10px] text-green-400/70 font-medium tracking-wide mt-0.5">
                Environmental Monitoring System
              </p>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Live simulation badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-900/30 border border-green-700/40">
              <Activity className="w-3.5 h-3.5 text-green-400" />
              <span className="text-[11px] font-semibold text-green-300 uppercase tracking-wider">
                Live Simulation
              </span>
              <span className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-green-400 pulse-green" : "bg-slate-500"}`} />
            </div>

            {/* Pause/Resume */}
            <button
              id="toggle-simulation-btn"
              onClick={onToggleLive}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/50 hover:bg-green-900/40 hover:border-green-700/40 transition-all text-slate-300 hover:text-green-300"
              title={isLive ? "Pause simulation" : "Resume simulation"}
            >
              {isLive ? (
                <PauseCircle className="w-4 h-4" />
              ) : (
                <PlayCircle className="w-4 h-4" />
              )}
              <span className="text-[11px] font-medium hidden sm:block">
                {isLive ? "Pause" : "Resume"}
              </span>
            </button>

            {/* System status */}
            <div className="flex items-center gap-4 px-4 py-2 rounded-xl bg-slate-900/60 border border-slate-700/40">
              <div className="flex items-center gap-2">
                <Wifi className="w-3.5 h-3.5 text-green-400" />
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider leading-none">
                    System
                  </p>
                  <p className="text-[12px] font-bold text-green-400 leading-tight">ONLINE</p>
                </div>
              </div>
              <div className="w-px h-7 bg-slate-700/60" />
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider leading-none">
                    Last Updated
                  </p>
                  <p className="text-[12px] font-bold text-slate-200 leading-tight font-mono">
                    {timeStr}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
