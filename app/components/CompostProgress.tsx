"use client";

import { Check } from "lucide-react";
import type { SensorReading } from "@/app/data/mockSensorData";
import { BIN_INFO } from "@/app/data/mockSensorData";
import { getDecompositionStage } from "@/app/lib/compostLogic";
import { Card, CardTitle, Note, ProgressBar } from "@/app/components/ui";

interface CompostProgressProps {
  data: SensorReading;
}

const STAGES = [
  "Fresh Waste",
  "Initial Decomposition",
  "Active Decomposition",
  "Maturation",
  "Ready",
] as const;

export default function CompostProgress({ data }: CompostProgressProps) {
  const weightReduced = data.initialWeight - data.currentWeight;
  const reductionPct = (weightReduced / data.initialWeight) * 100;
  const stage = getDecompositionStage(data);
  const stageIndex = STAGES.indexOf(stage);

  const stats = [
    { label: "Initial weight", value: data.initialWeight.toFixed(2), unit: "kg" },
    { label: "Current weight", value: data.currentWeight.toFixed(2), unit: "kg" },
    { label: "Weight reduced", value: weightReduced.toFixed(2), unit: "kg" },
    { label: "Batch day", value: String(BIN_INFO.batchDay), unit: `of ~${BIN_INFO.expectedDays}` },
  ];

  return (
    <Card>
      <CardTitle title="Compost progress" description="Weight-based decomposition tracking" />

      <dl className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-lg overflow-hidden border border-line bg-line">
        {stats.map((s) => (
          <div key={s.label} className="bg-card p-4">
            <dt className="text-xs text-muted">{s.label}</dt>
            <dd className="mt-1">
              <span className="text-xl font-semibold tracking-tight text-fg tabular-nums">{s.value}</span>
              <span className="text-xs text-muted ml-1">{s.unit}</span>
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-6">
        <div className="flex justify-between text-xs mb-2">
          <span className="text-muted">Weight reduction</span>
          <span className="font-medium text-fg tabular-nums">{reductionPct.toFixed(1)}%</span>
        </div>
        <ProgressBar value={reductionPct} />
      </div>

      {/* Stage stepper */}
      <div className="mt-8">
        <p className="text-xs text-muted mb-4">
          Stage: <span className="font-medium text-fg">{stage}</span>
        </p>
        <ol className="grid grid-cols-5">
          {STAGES.map((s, idx) => {
            const isActive = idx === stageIndex;
            const isPast = idx < stageIndex;
            return (
              <li key={s} className="relative flex flex-col items-center text-center">
                {idx > 0 && (
                  <span
                    className={`absolute top-3 right-1/2 w-full h-px ${idx <= stageIndex ? "bg-accent" : "bg-line"}`}
                  />
                )}
                <span
                  className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-medium border ${
                    isActive
                      ? "bg-accent border-accent text-on-accent"
                      : isPast
                      ? "bg-accent-soft border-accent text-accent"
                      : "bg-card border-line text-faint"
                  }`}
                >
                  {isPast ? <Check className="w-3 h-3" /> : idx + 1}
                </span>
                <span
                  className={`mt-2 text-[11px] leading-tight hidden sm:block px-1 ${
                    isActive ? "text-fg font-medium" : "text-muted"
                  }`}
                >
                  {s}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="mt-6">
        <Note>
          Weight reduction shows material loss and progress, but does not by itself confirm compost maturity.
          Temperature, moisture and gas readings should all be considered.
        </Note>
      </div>
    </Card>
  );
}
