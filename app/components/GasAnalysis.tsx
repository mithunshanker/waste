"use client";

import type { SensorReading } from "@/app/data/mockSensorData";
import { THRESHOLDS } from "@/app/data/mockSensorData";
import type { ParameterStatus } from "@/app/lib/compostLogic";
import {
  getCo2Interpretation, getCo2Status,
  getCh4Interpretation, getCh4Status,
  getNh3Interpretation, getNh3Status,
  getH2sInterpretation, getH2sStatus,
} from "@/app/lib/compostLogic";
import { Card, CardTitle, Note, ParamStatus } from "@/app/components/ui";

interface GasAnalysisProps {
  data: SensorReading;
}

interface GasRow {
  formula: string;
  name: string;
  value: number;
  warning: number;
  status: ParameterStatus;
  interpretation: string;
}

const barColor: Record<ParameterStatus, string> = {
  OPTIMAL: "bg-ok",
  LOW: "bg-warn",
  WARNING: "bg-warn",
  CRITICAL: "bg-bad",
};

function LevelBar({ value, warning, status }: { value: number; warning: number; status: ParameterStatus }) {
  // Scale so the warning threshold sits at 100%
  const pct = Math.min(100, (value / warning) * 100);
  return (
    <div className="h-1.5 w-full rounded-full bg-subtle overflow-hidden">
      <div className={`h-full rounded-full ${barColor[status]} transition-[width] duration-700`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function GasAnalysis({ data }: GasAnalysisProps) {
  const t = THRESHOLDS;
  const rows: GasRow[] = [
    { formula: "CO₂", name: "Carbon dioxide", value: data.co2, warning: t.co2.warning,
      status: getCo2Status(data.co2), interpretation: getCo2Interpretation(data.co2) },
    { formula: "CH₄", name: "Methane", value: data.methane, warning: t.methane.warning,
      status: getCh4Status(data.methane), interpretation: getCh4Interpretation(data.methane) },
    { formula: "NH₃", name: "Ammonia", value: data.ammonia, warning: t.ammonia.warning,
      status: getNh3Status(data.ammonia), interpretation: getNh3Interpretation(data.ammonia) },
    { formula: "H₂S", name: "Hydrogen sulfide", value: data.hydrogenSulfide, warning: t.hydrogenSulfide.warning,
      status: getH2sStatus(data.hydrogenSulfide), interpretation: getH2sInterpretation(data.hydrogenSulfide) },
  ];

  return (
    <Card>
      <CardTitle title="Gas readings" description="Bars show each reading against its warning threshold" />

      <div className="divide-y divide-line border-t border-line">
        {rows.map((row) => (
          <div
            key={row.formula}
            className="grid grid-cols-[1fr_auto] md:grid-cols-[180px_120px_1fr_90px] items-center gap-x-6 gap-y-2 py-4"
          >
            <div>
              <p className="text-sm font-medium text-fg">{row.formula}</p>
              <p className="text-xs text-muted">{row.name}</p>
            </div>
            <div className="text-right md:text-left">
              <span className="text-lg font-semibold text-fg tabular-nums">{row.value}</span>
              <span className="text-xs text-muted ml-1">ppm</span>
            </div>
            <div className="col-span-2 md:col-span-1 space-y-1.5">
              <LevelBar value={row.value} warning={row.warning} status={row.status} />
              <p className="text-xs text-muted leading-relaxed">{row.interpretation}</p>
            </div>
            <div className="hidden md:flex justify-end">
              <ParamStatus status={row.status} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <Note>Thresholds are demonstration values. Calibrate them for your sensor hardware and composting conditions.</Note>
      </div>
    </Card>
  );
}
