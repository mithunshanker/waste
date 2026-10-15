"use client";

import { CheckCircle2, AlertCircle, XCircle, Minus } from "lucide-react";
import type { HealthScore, ParameterStatus } from "@/app/lib/compostLogic";

interface CompostHealthProps {
  health: HealthScore;
  temperature: number;
  moisture: number;
  currentWeight: number;
  weightReduction: number;
}

const statusConfig: Record<ParameterStatus, { color: string; icon: React.ReactNode; label: string }> = {
  OPTIMAL: {
    color: "text-green-400",
    icon: <CheckCircle2 className="w-4 h-4 text-green-400" />,
    label: "Optimal",
  },
  LOW: {
    color: "text-amber-400",
    icon: <Minus className="w-4 h-4 text-amber-400" />,
    label: "Low",
  },
  WARNING: {
    color: "text-amber-400",
    icon: <AlertCircle className="w-4 h-4 text-amber-400" />,
    label: "Warning",
  },
  CRITICAL: {
    color: "text-red-400",
    icon: <XCircle className="w-4 h-4 text-red-400" />,
    label: "Critical",
  },
};

function RadialGauge({ score }: { score: number }) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  const trackColor = "#1a2e1a";
  const gaugeColor =
    clampedScore >= 80
      ? "#22c55e"
      : clampedScore >= 60
      ? "#a3e635"
      : clampedScore >= 40
      ? "#f59e0b"
      : "#ef4444";

  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg className="w-36 h-36 -rotate-90" viewBox="0 0 128 128">
        {/* Track */}
        <circle
          cx="64" cy="64" r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth="10"
        />
        {/* Progress */}
        <circle
          cx="64" cy="64" r={radius}
          fill="none"
          stroke={gaugeColor}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: "stroke-dashoffset 1s ease-in-out, stroke 0.5s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-3xl font-black leading-none"
          style={{ color: gaugeColor, transition: "color 0.5s ease" }}
        >
          {clampedScore}
        </span>
        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">
          Health
        </span>
      </div>
    </div>
  );
}

export default function CompostHealth({
  health,
  temperature,
  moisture,
  currentWeight,
  weightReduction,
}: CompostHealthProps) {
  const params = [
    { label: "Temperature", status: health.temperatureStatus, value: `${temperature}°C` },
    { label: "Moisture", status: health.moistureStatus, value: `${moisture}%` },
    { label: "Gas Conditions", status: health.gasStatus, value: "" },
    { label: "Weight Reduction", status: health.weightStatus, value: `${weightReduction.toFixed(1)}%` },
  ];

  const labelColor =
    health.score >= 80
      ? "text-green-400"
      : health.score >= 60
      ? "text-lime-400"
      : health.score >= 40
      ? "text-amber-400"
      : "text-red-400";

  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#0f2010] via-[#0d1f0d] to-[#0a150a] border border-green-800/40 p-6 shadow-xl shadow-black/30 card-hover">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xs font-semibold text-green-500 uppercase tracking-widest mb-1">
            Compost Health
          </h2>
          <p className="text-[11px] text-slate-500">Overall system score</p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-green-900/40 border border-green-700/30 text-[10px] font-bold text-green-400 uppercase tracking-wider">
          Live
        </span>
      </div>

      <div className="flex flex-col items-center gap-3">
        <RadialGauge score={health.score} />
        <div className="text-center">
          <p className={`text-lg font-black tracking-tight ${labelColor}`}>
            {health.label}
          </p>
        </div>
      </div>

      {/* Parameter checklist */}
      <div className="mt-5 space-y-2">
        {params.map((p) => {
          const cfg = statusConfig[p.status];
          return (
            <div
              key={p.label}
              className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-white/[0.03] border border-white/5"
            >
              <div className="flex items-center gap-2">
                {cfg.icon}
                <span className="text-[12px] text-slate-300">{p.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {p.value && (
                  <span className="text-[11px] font-mono text-slate-400">{p.value}</span>
                )}
                <span className={`text-[11px] font-bold ${cfg.color}`}>{cfg.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
