"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { HistoricalPoint } from "@/app/data/mockSensorData";
import { HISTORY_6H, HISTORY_24H, HISTORY_7D } from "@/app/data/mockSensorData";

type Range = "6H" | "24H" | "7D";

const RANGE_DATA: Record<Range, HistoricalPoint[]> = {
  "6H": HISTORY_6H,
  "24H": HISTORY_24H,
  "7D": HISTORY_7D,
};

// Custom dark tooltip
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0d1f0d] border border-green-800/50 rounded-xl px-4 py-3 shadow-xl text-sm">
      <p className="text-slate-400 text-[11px] mb-2 font-mono">{label}</p>
      {payload.map((entry: { color: string; name: string; value: number }) => (
        <div key={entry.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-slate-300 text-[12px] capitalize">{entry.name}:</span>
          <span className="text-white font-bold text-[12px]">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

function RangeButton({
  range,
  active,
  onClick,
}: {
  range: Range;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-lg text-[12px] font-bold transition-all ${
        active
          ? "bg-green-600 text-white shadow"
          : "text-slate-400 hover:text-green-300 hover:bg-green-900/30"
      }`}
    >
      {range}
    </button>
  );
}

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: (data: HistoricalPoint[], range: Range) => React.ReactNode;
}

function ChartCard({ title, subtitle, children }: ChartCardProps) {
  const [range, setRange] = useState<Range>("24H");
  const data = RANGE_DATA[range];

  return (
    <div className="rounded-2xl bg-[#0d1f0d]/80 border border-green-800/30 p-5 shadow-xl shadow-black/20">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-100">{title}</h3>
          {subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-1 bg-slate-900/60 rounded-lg p-1 border border-slate-700/30">
          {(["6H", "24H", "7D"] as Range[]).map((r) => (
            <RangeButton key={r} range={r} active={range === r} onClick={() => setRange(r)} />
          ))}
        </div>
      </div>
      {children(data, range)}
    </div>
  );
}

export function TemperatureChart() {
  return (
    <ChartCard title="Temperature" subtitle="°C over time — indirect indicator of microbial activity">
      {(data) => (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
            <defs>
              <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2e1a" />
            <XAxis dataKey="time" tick={{ fill: "#475569", fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fill: "#475569", fontSize: 10 }} tickLine={false} axisLine={false} domain={["auto", "auto"]} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="temperature"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#tempGrad)"
              dot={false}
              activeDot={{ r: 5, fill: "#22c55e", strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

export function MoistureChart() {
  return (
    <ChartCard title="Moisture" subtitle="% moisture level — optimal range 50–70%">
      {(data) => (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
            <defs>
              <linearGradient id="moistGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2e1a" />
            <XAxis dataKey="time" tick={{ fill: "#475569", fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fill: "#475569", fontSize: 10 }} tickLine={false} axisLine={false} domain={[30, 90]} />
            <Tooltip content={<CustomTooltip />} />
            {/* Reference band for optimal range — shown via fill */}
            <Area
              type="monotone"
              dataKey="moisture"
              stroke="#38bdf8"
              strokeWidth={2}
              fill="url(#moistGrad)"
              dot={false}
              activeDot={{ r: 5, fill: "#38bdf8", strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

export function WeightChart() {
  return (
    <ChartCard title="Compost Weight" subtitle="kg — gradual reduction indicates decomposition progress">
      {(data) => (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
            <defs>
              <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a3e635" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#a3e635" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2e1a" />
            <XAxis dataKey="time" tick={{ fill: "#475569", fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fill: "#475569", fontSize: 10 }} tickLine={false} axisLine={false} domain={["auto", "auto"]} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="weight"
              stroke="#a3e635"
              strokeWidth={2}
              fill="url(#weightGrad)"
              dot={false}
              activeDot={{ r: 5, fill: "#a3e635", strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

export function GasChart() {
  return (
    <ChartCard title="Gas Levels" subtitle="ppm — CO₂, CH₄, NH₃, H₂S trends over time">
      {(data) => (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
            <defs>
              <linearGradient id="co2Grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="ch4Grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2e1a" />
            <XAxis dataKey="time" tick={{ fill: "#475569", fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fill: "#475569", fontSize: 10 }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: "11px", color: "#94a3b8", paddingTop: "8px" }}
              formatter={(value) => (
                <span style={{ color: "#94a3b8", fontSize: "11px", textTransform: "capitalize" }}>
                  {value}
                </span>
              )}
            />
            <Area type="monotone" dataKey="co2" stroke="#22c55e" strokeWidth={1.5} fill="url(#co2Grad)" dot={false} />
            <Area type="monotone" dataKey="methane" stroke="#f59e0b" strokeWidth={1.5} fill="url(#ch4Grad)" dot={false} />
            <Area type="monotone" dataKey="ammonia" stroke="#a78bfa" strokeWidth={1.5} fill="none" dot={false} />
            <Area type="monotone" dataKey="h2s" stroke="#f87171" strokeWidth={1.5} fill="none" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}
