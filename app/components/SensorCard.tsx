"use client";

import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import type { ParameterStatus } from "@/app/lib/compostLogic";
import type { LucideIcon } from "lucide-react";
import { ParamStatus } from "@/app/components/ui";

interface SensorCardProps {
  id: string;
  icon: LucideIcon;
  label: string;
  value: number | string;
  unit: string;
  status?: ParameterStatus;
  badge?: React.ReactNode; // replaces the status badge when given
  trend?: number;   // positive = up, negative = down, 0 = flat
  trendUnit?: string;
  subtitle?: string;
  size?: "md" | "sm";
}

export default function SensorCard({
  id,
  icon: Icon,
  label,
  value,
  unit,
  status,
  badge,
  trend,
  trendUnit = "",
  subtitle,
  size = "md",
}: SensorCardProps) {
  const TrendIcon =
    trend === undefined || trend === 0
      ? Minus
      : trend > 0
      ? ArrowUpRight
      : ArrowDownRight;

  return (
    <div id={id} className={`rounded-xl border border-line bg-card ${size === "md" ? "p-5" : "p-4"}`}>
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="inline-flex items-center gap-1.5 text-xs text-muted min-w-0">
          <Icon className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{label}</span>
        </span>
        {badge ?? (status && <ParamStatus status={status} />)}
      </div>

      <div className="flex items-baseline gap-1">
        <span
          className={`${size === "md" ? "text-3xl" : "text-2xl"} font-semibold tracking-tight text-fg tabular-nums`}
        >
          {value}
        </span>
        <span className="text-sm text-muted">{unit}</span>
      </div>

      {(subtitle || trend !== undefined) && (
        <div className="flex items-center justify-between gap-2 mt-2 text-xs text-muted">
          <span className="truncate">{subtitle}</span>
          {trend !== undefined && (
            <span className="inline-flex items-center gap-0.5 tabular-nums shrink-0">
              <TrendIcon className="w-3.5 h-3.5" />
              {trend > 0 ? "+" : ""}
              {trend}
              {trendUnit}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
