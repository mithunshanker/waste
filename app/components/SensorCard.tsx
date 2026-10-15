"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { ParameterStatus } from "@/app/lib/compostLogic";
import type { LucideIcon } from "lucide-react";

interface SensorCardProps {
  id: string;
  icon: LucideIcon;
  label: string;
  value: number | string;
  unit: string;
  status: ParameterStatus;
  trend?: number;   // positive = up, negative = down, 0 = flat
  trendUnit?: string;
  subtitle?: string;
  iconColor?: string;
  onClick?: () => void;
}

const statusStyles: Record<ParameterStatus, { border: string; badge: string; text: string; bg: string }> = {
  OPTIMAL:  { border: "border-green-700/40",  badge: "bg-green-900/60 text-green-300",  text: "text-green-400",  bg: "from-green-900/20" },
  LOW:      { border: "border-amber-700/30",  badge: "bg-amber-900/60 text-amber-300",  text: "text-amber-400",  bg: "from-amber-900/10" },
  WARNING:  { border: "border-amber-700/40",  badge: "bg-amber-900/60 text-amber-300",  text: "text-amber-400",  bg: "from-amber-900/10" },
  CRITICAL: { border: "border-red-700/50",    badge: "bg-red-900/60 text-red-300",      text: "text-red-400",    bg: "from-red-900/15"  },
};

const statusLabel: Record<ParameterStatus, string> = {
  OPTIMAL:  "Optimal",
  LOW:      "Low",
  WARNING:  "Warning",
  CRITICAL: "Critical",
};

export default function SensorCard({
  id,
  icon: Icon,
  label,
  value,
  unit,
  status,
  trend,
  trendUnit = "",
  subtitle,
  iconColor = "text-green-400",
  onClick,
}: SensorCardProps) {
  const styles = statusStyles[status];

  const TrendIcon =
    trend === undefined || trend === 0
      ? Minus
      : trend > 0
      ? TrendingUp
      : TrendingDown;

  const trendColor =
    trend === undefined || trend === 0
      ? "text-slate-500"
      : trend > 0
      ? "text-green-400"
      : "text-sky-400";

  return (
    <button
      id={id}
      onClick={onClick}
      className={`
        w-full text-left rounded-2xl border ${styles.border}
        bg-gradient-to-br ${styles.bg} via-[#0d1f0d]/80 to-[#0a150a]
        p-5 shadow-lg shadow-black/20
        card-hover cursor-pointer group
        transition-all duration-200
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className={`w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform`}>
          <Icon className={`w-4.5 h-4.5 ${iconColor}`} size={18} />
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles.badge}`}>
          {statusLabel[status]}
        </span>
      </div>

      {/* Value */}
      <div className="mb-2">
        <div className="flex items-end gap-1.5">
          <span className={`text-3xl font-black leading-none sensor-value ${styles.text}`}>
            {value}
          </span>
          <span className="text-sm text-slate-400 mb-1 font-medium">{unit}</span>
        </div>
        {subtitle && (
          <p className="text-[11px] text-slate-500 mt-1">{subtitle}</p>
        )}
      </div>

      {/* Label & Trend */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
        <span className="text-[12px] font-semibold text-slate-400 uppercase tracking-wide">
          {label}
        </span>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 ${trendColor}`}>
            <TrendIcon size={13} />
            <span className="text-[11px] font-mono font-semibold">
              {trend > 0 ? "+" : ""}{trend}{trendUnit}
            </span>
          </div>
        )}
      </div>
    </button>
  );
}
