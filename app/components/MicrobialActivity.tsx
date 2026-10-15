"use client";

import type { SensorReading } from "@/app/data/mockSensorData";
import {
  getTemperatureStatus,
  getMoistureStatus,
  getGasStatus,
  getMicrobialActivity,
} from "@/app/lib/compostLogic";

interface MicrobialActivityProps {
  data: SensorReading;
}

const microbialColors: Record<string, { bar: string; text: string; badge: string }> = {
  HIGH:     { bar: "bg-gradient-to-r from-green-600 to-lime-400", text: "text-green-400", badge: "bg-green-900/60 border-green-700/40 text-green-300" },
  MODERATE: { bar: "bg-gradient-to-r from-amber-600 to-yellow-400", text: "text-amber-400", badge: "bg-amber-900/60 border-amber-700/40 text-amber-300" },
  LOW:      { bar: "bg-gradient-to-r from-slate-600 to-slate-400", text: "text-slate-400", badge: "bg-slate-800/60 border-slate-700/40 text-slate-300" },
};

const microbialBarWidth: Record<string, string> = {
  HIGH: "85%",
  MODERATE: "50%",
  LOW: "20%",
};

function EnvRow({
  label,
  status,
  value,
}: {
  label: string;
  status: string;
  value: string;
}) {
  const isOptimal = status === "OPTIMAL";
  const isWarning = status === "WARNING" || status === "LOW";
  const dotColor = isOptimal ? "bg-green-400" : isWarning ? "bg-amber-400" : "bg-red-400";
  const statusText = isOptimal ? "text-green-400" : isWarning ? "text-amber-400" : "text-red-400";

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-2.5">
        <span className={`w-2 h-2 rounded-full ${dotColor} shrink-0`} />
        <span className="text-[13px] text-slate-300">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-slate-500 font-mono">{value}</span>
        <span className={`text-[11px] font-bold uppercase ${statusText}`}>{status}</span>
      </div>
    </div>
  );
}

export default function MicrobialActivityCard({ data }: MicrobialActivityProps) {
  const activity = getMicrobialActivity(data.temperature);
  const colors = microbialColors[activity];

  const tempStatus = getTemperatureStatus(data.temperature);
  const moistStatus = getMoistureStatus(data.moisture);
  const gasStatus = getGasStatus(data);

  const aerationStatus =
    data.methane > 30 || data.hydrogenSulfide > 3 ? "POOR" : data.methane > 15 ? "FAIR" : "GOOD";

  return (
    <div className="rounded-2xl bg-[#0d1f0d]/80 border border-green-800/30 p-5 shadow-xl shadow-black/20">
      <h2 className="text-sm font-bold text-slate-100 mb-1">Microbial Activity</h2>
      <p className="text-[11px] text-slate-500 mb-5">
        Inferred from temperature — not directly measured
      </p>

      {/* Activity level */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[12px] text-slate-400 font-medium">Activity Level</span>
        <span className={`px-3 py-1 rounded-full border text-xs font-black uppercase tracking-wider ${colors.badge}`}>
          {activity}
        </span>
      </div>

      <div className="h-2.5 rounded-full bg-slate-800/60 border border-slate-700/30 overflow-hidden mb-6">
        <div
          className={`h-full rounded-full ${colors.bar} transition-all duration-1000`}
          style={{ width: microbialBarWidth[activity] }}
        />
      </div>

      {/* Temperature indicator */}
      <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4 mb-5">
        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Measured Temperature</p>
        <div className="flex items-end gap-2">
          <span className={`text-4xl font-black ${colors.text}`}>{data.temperature.toFixed(1)}</span>
          <span className="text-slate-400 text-lg mb-1 font-medium">°C</span>
        </div>
        <div className="mt-2 px-2.5 py-1 inline-block rounded-full bg-green-900/40 border border-green-700/30">
          <span className="text-[11px] text-green-300 font-semibold">ACTIVE DECOMPOSITION</span>
        </div>
      </div>

      {/* Explanation */}
      <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-800/30 mb-5">
        <p className="text-[11px] text-blue-300/80 leading-relaxed">
          Temperature is used as an <em>indirect indicator</em> of microbial activity. Higher temperatures during active composting can suggest increased microbial activity, but this is not a direct measurement.
        </p>
      </div>

      {/* Environmental conditions summary */}
      <div>
        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-2">
          Compost Environment
        </p>
        <EnvRow label="Temperature" status={tempStatus} value={`${data.temperature.toFixed(1)}°C`} />
        <EnvRow label="Moisture" status={moistStatus} value={`${data.moisture}%`} />
        <EnvRow label="Gas Conditions" status={gasStatus} value="Monitored" />
        <EnvRow label="Aeration" status={aerationStatus} value="Inferred" />
        <EnvRow label="Microbial Activity" status={activity} value="Inferred" />
      </div>
    </div>
  );
}
