"use client";

import type { SensorReading } from "@/app/data/mockSensorData";
import {
  getTemperatureStatus,
  getMoistureStatus,
  getGasStatus,
  getMicrobialActivity,
  getDecompositionStage,
} from "@/app/lib/compostLogic";
import { Card, CardTitle, Note, ProgressBar, StatusDot, statusTone, statusLabel, type Tone } from "@/app/components/ui";

interface MicrobialActivityProps {
  data: SensorReading;
}

const activityTone: Record<string, Tone> = { HIGH: "ok", MODERATE: "warn", LOW: "neutral" };
const activityWidth: Record<string, number> = { HIGH: 85, MODERATE: 50, LOW: 20 };
const aerationTone: Record<string, Tone> = { GOOD: "ok", FAIR: "warn", POOR: "bad" };

function toTitle(s: string) {
  return s.charAt(0) + s.slice(1).toLowerCase();
}

export default function MicrobialActivityCard({ data }: MicrobialActivityProps) {
  const activity = getMicrobialActivity(data.temperature);
  const stage = getDecompositionStage(data);

  const tempStatus = getTemperatureStatus(data.temperature);
  const moistStatus = getMoistureStatus(data.moisture);
  const gasStatus = getGasStatus(data);

  const aerationStatus =
    data.methane > 30 || data.hydrogenSulfide > 3 ? "POOR" : data.methane > 15 ? "FAIR" : "GOOD";

  const rows: { label: string; value: string; tone: Tone; status: string }[] = [
    { label: "Temperature", value: `${data.temperature.toFixed(1)} °C`, tone: statusTone(tempStatus), status: statusLabel[tempStatus] },
    { label: "Moisture", value: `${data.moisture}%`, tone: statusTone(moistStatus), status: statusLabel[moistStatus] },
    { label: "Gases", value: "Monitored", tone: statusTone(gasStatus), status: statusLabel[gasStatus] },
    { label: "Aeration", value: "Inferred", tone: aerationTone[aerationStatus], status: toTitle(aerationStatus) },
  ];

  return (
    <Card>
      <CardTitle title="Microbial activity" description="Inferred from temperature, not measured directly" />

      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-3xl font-semibold tracking-tight text-fg">{toTitle(activity)}</p>
          <p className="text-xs text-muted mt-1">
            at {data.temperature.toFixed(1)} °C · {stage}
          </p>
        </div>
        <StatusDot tone={activityTone[activity]} label="Activity" />
      </div>
      <ProgressBar value={activityWidth[activity]} className="mt-4" />

      <dl className="mt-5 divide-y divide-line border-t border-line">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between py-2.5 text-sm">
            <dt className="text-muted">{r.label}</dt>
            <dd className="flex items-center gap-3">
              <span className="text-fg tabular-nums">{r.value}</span>
              <StatusDot tone={r.tone} label={r.status} />
            </dd>
          </div>
        ))}
      </dl>

      <div className="pt-4">
        <Note>
          Higher temperatures during active composting suggest more microbial activity, but temperature is an
          indirect indicator only.
        </Note>
      </div>
    </Card>
  );
}
