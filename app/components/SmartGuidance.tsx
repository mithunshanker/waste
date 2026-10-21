"use client";

import { useState } from "react";
import { Check, RefreshCw } from "lucide-react";
import type { Recommendation, Severity } from "@/app/lib/compostLogic";
import type { GuidanceLog } from "@/app/data/mockSensorData";
import { Card, CardTitle, Dot, StatusDot, type Tone } from "@/app/components/ui";

interface SmartGuidanceProps {
  recommendation: Recommendation;
  guidanceLog: GuidanceLog[];
  onMarkDone: () => void;
  onRefresh: () => void;
}

const severityTone: Record<Severity, Tone> = {
  good: "ok",
  info: "info",
  warning: "warn",
  critical: "bad",
};

const severityLabel: Record<Severity, string> = {
  good: "All clear",
  info: "Info",
  warning: "Action needed",
  critical: "Critical",
};

export default function SmartGuidance({
  recommendation,
  guidanceLog,
  onMarkDone,
  onRefresh,
}: SmartGuidanceProps) {
  const [checkedDone, setCheckedDone] = useState(false);

  const handleMarkDone = () => {
    setCheckedDone(true);
    onMarkDone();
    setTimeout(() => setCheckedDone(false), 4000);
  };

  return (
    <div className="space-y-4">
      {/* Current recommendation */}
      <Card>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs text-muted">Current recommendation</span>
          <StatusDot tone={severityTone[recommendation.severity]} label={severityLabel[recommendation.severity]} />
        </div>

        <h3 className="text-lg font-semibold tracking-tight text-fg">{recommendation.title}</h3>
        <p className="text-sm text-muted leading-relaxed mt-1.5">{recommendation.message}</p>

        <div className="mt-4 rounded-lg bg-subtle px-4 py-3">
          <p className="text-xs font-medium text-muted mb-0.5">Recommended action</p>
          <p className="text-sm text-fg leading-relaxed">{recommendation.action}</p>
        </div>

        <div className="flex items-center gap-2 mt-4 flex-wrap">
          <button
            id="mark-done-btn"
            onClick={handleMarkDone}
            disabled={checkedDone}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-accent text-on-accent text-sm font-medium hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            <Check className="w-4 h-4" />
            {checkedDone ? "Checked, new reading taken" : "Mark as done"}
          </button>
          <button
            id="refresh-readings-btn"
            onClick={onRefresh}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg border border-line text-sm font-medium text-fg hover:bg-subtle transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <span className="text-xs text-faint ml-auto">Next check in ~15 min</span>
        </div>
      </Card>

      {/* Recent guidance log */}
      <Card>
        <CardTitle title="Recent activity" />
        <ol className="relative">
          {guidanceLog.map((log, i) => (
            <li
              key={log.id}
              className="relative pl-6 pb-4 last:pb-0 fade-in"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              {i < guidanceLog.length - 1 && (
                <span className="absolute left-[3px] top-3 bottom-0 w-px bg-line" />
              )}
              <Dot tone={severityTone[log.severity]} className="absolute left-0 top-1.5 w-[7px]! h-[7px]!" />
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-medium text-fg">{log.title}</p>
                <span className="text-xs text-faint shrink-0 tabular-nums">{log.timestamp}</span>
              </div>
              <p className="text-sm text-muted leading-relaxed mt-0.5">{log.message}</p>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
