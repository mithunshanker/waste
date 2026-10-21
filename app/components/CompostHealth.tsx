"use client";

import type { HealthScore } from "@/app/lib/compostLogic";
import { Card, CardTitle, ParamStatus } from "@/app/components/ui";

interface CompostHealthProps {
  health: HealthScore;
  temperature: number;
  moisture: number;
  currentWeight: number;
  weightReduction: number;
}

function Ring({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const color = clamped >= 70 ? "var(--accent)" : clamped >= 40 ? "var(--warn)" : "var(--bad)";

  return (
    <div className="relative w-32 h-32">
      <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--subtle)" strokeWidth="6" />
        <circle
          cx="60" cy="60" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s ease, stroke 0.4s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold tracking-tight text-fg tabular-nums">{clamped}</span>
        <span className="text-xs text-muted">of 100</span>
      </div>
    </div>
  );
}

function toTitle(label: string) {
  return label.charAt(0) + label.slice(1).toLowerCase();
}

export default function CompostHealth({
  health,
  temperature,
  moisture,
  weightReduction,
}: CompostHealthProps) {
  const params = [
    { label: "Temperature", status: health.temperatureStatus, value: `${temperature} °C` },
    { label: "Moisture", status: health.moistureStatus, value: `${moisture}%` },
    { label: "Gases", status: health.gasStatus, value: "" },
    { label: "Weight loss", status: health.weightStatus, value: `${weightReduction.toFixed(1)}%` },
  ];

  return (
    <Card className="h-full flex flex-col">
      <CardTitle title="Compost health" description="Combined score from all sensors" />

      <div className="flex flex-col items-center gap-2 py-2">
        <Ring score={health.score} />
        <p className="text-sm font-medium text-fg">{toTitle(health.label)}</p>
      </div>

      <dl className="mt-4 divide-y divide-line border-t border-line">
        {params.map((p) => (
          <div key={p.label} className="flex items-center justify-between py-2.5 text-sm">
            <dt className="text-muted">{p.label}</dt>
            <dd className="flex items-center gap-3">
              {p.value && <span className="text-fg tabular-nums">{p.value}</span>}
              <ParamStatus status={p.status} />
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
