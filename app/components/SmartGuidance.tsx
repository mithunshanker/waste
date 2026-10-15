"use client";

import { useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Clock, RefreshCw, Lightbulb } from "lucide-react";
import type { Recommendation, Severity } from "@/app/lib/compostLogic";
import type { GuidanceLog } from "@/app/data/mockSensorData";

interface SmartGuidanceProps {
  recommendation: Recommendation;
  guidanceLog: GuidanceLog[];
  onMarkDone: () => void;
  onRefresh: () => void;
}

const severityConfig: Record<
  Severity,
  { bg: string; border: string; icon: React.ReactNode; badge: string; badgeText: string; actionBg: string }
> = {
  good: {
    bg: "from-green-900/30 to-green-950/20",
    border: "border-green-700/50",
    icon: <CheckCircle2 className="w-6 h-6 text-green-400" />,
    badge: "bg-green-900/60 border-green-700/40 text-green-300",
    badgeText: "ALL CLEAR",
    actionBg: "bg-green-700 hover:bg-green-600 text-white",
  },
  info: {
    bg: "from-blue-900/20 to-blue-950/10",
    border: "border-blue-700/40",
    icon: <Lightbulb className="w-6 h-6 text-blue-400" />,
    badge: "bg-blue-900/60 border-blue-700/40 text-blue-300",
    badgeText: "INFO",
    actionBg: "bg-blue-700 hover:bg-blue-600 text-white",
  },
  warning: {
    bg: "from-amber-900/25 to-amber-950/10",
    border: "border-amber-700/50",
    icon: <AlertTriangle className="w-6 h-6 text-amber-400" />,
    badge: "bg-amber-900/60 border-amber-700/40 text-amber-300",
    badgeText: "ACTION REQUIRED",
    actionBg: "bg-amber-600 hover:bg-amber-500 text-white",
  },
  critical: {
    bg: "from-red-900/30 to-red-950/10",
    border: "border-red-700/50",
    icon: <XCircle className="w-6 h-6 text-red-400" />,
    badge: "bg-red-900/60 border-red-700/40 text-red-300",
    badgeText: "CRITICAL",
    actionBg: "bg-red-600 hover:bg-red-500 text-white",
  },
};

const logSeverityIcon: Record<GuidanceLog["severity"], React.ReactNode> = {
  good: <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />,
  info: <Lightbulb className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />,
  critical: <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />,
};

const logBorderColor: Record<GuidanceLog["severity"], string> = {
  good: "border-green-700/30",
  info: "border-blue-700/30",
  warning: "border-amber-700/30",
  critical: "border-red-700/30",
};

export default function SmartGuidance({
  recommendation,
  guidanceLog,
  onMarkDone,
  onRefresh,
}: SmartGuidanceProps) {
  const [checkedDone, setCheckedDone] = useState(false);

  const cfg = severityConfig[recommendation.severity];

  const handleMarkDone = () => {
    setCheckedDone(true);
    onMarkDone();
    setTimeout(() => setCheckedDone(false), 4000);
  };

  return (
    <div className="space-y-5">
      {/* Current Recommendation */}
      <div className={`rounded-2xl bg-gradient-to-br ${cfg.bg} border ${cfg.border} p-5 shadow-xl shadow-black/20`}>
        <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-sm font-bold text-slate-100">Smart Compost Guidance</h2>
          <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${cfg.badge}`}>
            {cfg.badgeText}
          </span>
        </div>

        {/* Recommendation body */}
        <div className="flex items-start gap-4">
          <div className="mt-0.5">{cfg.icon}</div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-white mb-2">{recommendation.title}</h3>
            <p className="text-[13px] text-slate-300 leading-relaxed mb-3">{recommendation.message}</p>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1">
                Recommended Action
              </p>
              <p className="text-[13px] text-slate-200 leading-relaxed">{recommendation.action}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-5 flex-wrap">
          {checkedDone ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-900/50 border border-green-700/50 text-green-300 text-sm font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Condition Checked — Simulating new reading…</span>
            </div>
          ) : (
            <button
              id="mark-done-btn"
              onClick={handleMarkDone}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg ${cfg.actionBg}`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Mark as Done
            </button>
          )}
          <button
            id="refresh-readings-btn"
            onClick={onRefresh}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40 text-slate-300 hover:text-green-300 hover:border-green-700/40 text-sm font-medium transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Readings
          </button>
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] ml-auto">
            <Clock className="w-3.5 h-3.5" />
            <span>Next check: ~15 min</span>
          </div>
        </div>
      </div>

      {/* Recent Guidance Log */}
      <div className="rounded-2xl bg-[#0d1f0d]/80 border border-green-800/30 p-5 shadow-xl shadow-black/20">
        <h3 className="text-sm font-bold text-slate-100 mb-4">Recent Guidance</h3>
        <div className="relative space-y-0">
          {/* Timeline line */}
          <div className="absolute left-[15px] top-4 bottom-4 w-px bg-green-900/40" />

          {guidanceLog.map((log, i) => (
            <div key={log.id} className="relative pl-10 pb-4 last:pb-0 fade-in" style={{ animationDelay: `${i * 60}ms` }}>
              {/* Dot */}
              <div className="absolute left-0 top-0.5 w-[30px] h-[30px] rounded-full bg-[#0a150a] border border-green-800/40 flex items-center justify-center">
                {logSeverityIcon[log.severity]}
              </div>

              <div className={`rounded-xl border ${logBorderColor[log.severity]} bg-white/[0.02] p-3`}>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[11px] text-slate-500 font-mono">{log.timestamp}</span>
                  <span className="text-[11px] font-semibold text-slate-300">— {log.title}</span>
                </div>
                <p className="text-[12px] text-slate-400 leading-relaxed">{log.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
