"use client";

import { Leaf, Pause, Play } from "lucide-react";
import { BIN_INFO } from "@/app/data/mockSensorData";

interface HeaderProps {
  lastUpdated: Date;
  isLive: boolean;
  onToggleLive: () => void;
}

export default function Header({ lastUpdated, isLive, onToggleLive }: HeaderProps) {
  const timeStr = lastUpdated.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-surface/85 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-accent-soft flex items-center justify-center shrink-0">
            <Leaf className="w-4 h-4 text-accent" />
          </div>
          <span className="font-semibold text-fg tracking-tight truncate">Smart Compost Bin</span>
          <span className="hidden md:inline text-faint">/</span>
          <span className="hidden md:inline text-muted truncate">
            {BIN_INFO.id} · {BIN_INFO.location}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-muted">
            <span
              className={`w-2 h-2 rounded-full ${isLive ? "bg-accent live-dot" : "bg-faint"}`}
            />
            <span className="hidden sm:inline">{isLive ? "Live" : "Paused"} ·</span>
            <span className="tabular-nums" suppressHydrationWarning>{timeStr}</span>
          </div>
          <button
            id="toggle-simulation-btn"
            onClick={onToggleLive}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-line bg-card text-xs font-medium text-fg hover:bg-subtle transition-colors"
            title={isLive ? "Pause simulation" : "Resume simulation"}
          >
            {isLive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isLive ? "Pause" : "Resume"}
          </button>
        </div>
      </div>
    </header>
  );
}
