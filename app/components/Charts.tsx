"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
} from "recharts";
import type { History, HistoricalPoint, HistoryRange } from "@/app/data/mockSensorData";
import { THRESHOLDS } from "@/app/data/mockSensorData";
import { Card, CardTitle, useChartColors, type ChartColors } from "@/app/components/ui";

const RANGES: HistoryRange[] = ["6H", "24H", "7D"];
const CHART_HEIGHT = 200;
const GAS_UNITS = { co2: " ppm", methane: " ppm", ammonia: " ppm", h2s: " ppm" };

const SERIES_LABEL: Record<string, string> = {
  temperature: "Temperature",
  moisture: "Moisture",
  weight: "Weight",
  co2: "CO₂",
  methane: "CH₄",
  ammonia: "NH₃",
  h2s: "H₂S",
};

interface TooltipEntry {
  color: string;
  dataKey: string;
  value: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChartTooltip({ active, payload, label, units = {} }: any) {
  if (!active || !payload?.length) return null;
  const unit = units as Record<string, string>;
  return (
    <div className="rounded-lg border border-line bg-card px-3 py-2 shadow-sm text-xs">
      <p className="text-muted mb-1">{label}</p>
      {(payload as TooltipEntry[]).map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-muted">{SERIES_LABEL[entry.dataKey] ?? entry.dataKey}</span>
          <span className="ml-auto pl-3 font-medium text-fg tabular-nums">
            {entry.value}
            {unit[entry.dataKey] ?? ""}
          </span>
        </div>
      ))}
    </div>
  );
}

function RangeSwitch({ range, onChange }: { range: HistoryRange; onChange: (r: HistoryRange) => void }) {
  return (
    <div className="inline-flex rounded-lg border border-line p-0.5 bg-subtle shrink-0">
      {RANGES.map((r) => (
        <button
          key={r}
          onClick={() => onChange(r)}
          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
            range === r ? "bg-card text-fg shadow-sm" : "text-muted hover:text-fg"
          }`}
        >
          {r}
        </button>
      ))}
    </div>
  );
}

interface ChartCardProps {
  title: string;
  subtitle?: string;
  history: History | null;
  legend?: { label: string; color: string }[];
  children: (data: HistoricalPoint[], colors: ChartColors) => React.ReactElement;
}

function ChartCard({ title, subtitle, history, legend, children }: ChartCardProps) {
  const [range, setRange] = useState<HistoryRange>("24H");
  const colors = useChartColors();

  return (
    <Card className="min-w-0">
      <CardTitle title={title} description={subtitle} right={<RangeSwitch range={range} onChange={setRange} />} />
      <div style={{ height: CHART_HEIGHT }}>
        {history ? (
          <ResponsiveContainer width="100%" height="100%">
            {children(history[range], colors)}
          </ResponsiveContainer>
        ) : (
          <div className="h-full rounded-lg bg-subtle animate-pulse" />
        )}
      </div>
      {legend && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-muted">
          {legend.map((l) => (
            <span key={l.label} className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 rounded-full" style={{ background: l.color }} />
              {l.label}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
}

function axisProps(colors: ChartColors) {
  return {
    tick: { fill: colors.faint, fontSize: 11 },
    tickLine: false,
    axisLine: false,
  } as const;
}

function SingleSeriesChart({
  data,
  colors,
  dataKey,
  color,
  unit,
  domain,
  band,
}: {
  data: HistoricalPoint[];
  colors: ChartColors;
  dataKey: keyof HistoricalPoint;
  color: string;
  unit: string;
  domain: [number | "auto", number | "auto"];
  band?: [number, number];
}) {
  const gradId = `grad-${dataKey}`;
  return (
    <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.12} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid vertical={false} stroke={colors.line} />
      {band && <ReferenceArea y1={band[0]} y2={band[1]} fill={colors.accent} fillOpacity={0.06} stroke="none" />}
      <XAxis dataKey="time" {...axisProps(colors)} interval="preserveStartEnd" minTickGap={40} />
      <YAxis {...axisProps(colors)} domain={domain} width={48} />
      <Tooltip content={<ChartTooltip units={{ [dataKey]: unit }} />} cursor={{ stroke: colors.line }} />
      <Area
        type="monotone"
        dataKey={dataKey}
        stroke={color}
        strokeWidth={1.75}
        fill={`url(#${gradId})`}
        dot={false}
        activeDot={{ r: 3.5, fill: color, strokeWidth: 0 }}
        isAnimationActive={false}
      />
    </AreaChart>
  );
}

export function TemperatureChart({ history }: { history: History | null }) {
  const t = THRESHOLDS.temperature;
  return (
    <ChartCard title="Temperature" subtitle={`°C · shaded band = optimal ${t.optimal_low}–${t.optimal_high} °C`} history={history}>
      {(data, c) => (
        <SingleSeriesChart data={data} colors={c} dataKey="temperature" color={c["c-temp"]} unit=" °C"
          domain={[30, 75]} band={[t.optimal_low, t.optimal_high]} />
      )}
    </ChartCard>
  );
}

export function MoistureChart({ history }: { history: History | null }) {
  const m = THRESHOLDS.moisture;
  return (
    <ChartCard title="Moisture" subtitle={`% · shaded band = optimal ${m.optimal_low}–${m.optimal_high}%`} history={history}>
      {(data, c) => (
        <SingleSeriesChart data={data} colors={c} dataKey="moisture" color={c["c-moist"]} unit="%"
          domain={[30, 90]} band={[m.optimal_low, m.optimal_high]} />
      )}
    </ChartCard>
  );
}

export function WeightChart({ history }: { history: History | null }) {
  return (
    <ChartCard title="Weight" subtitle="kg · steady decline means decomposition is progressing" history={history}>
      {(data, c) => (
        <SingleSeriesChart data={data} colors={c} dataKey="weight" color={c["c-weight"]} unit=" kg"
          domain={["auto", "auto"]} />
      )}
    </ChartCard>
  );
}

export function GasChart({ history }: { history: History | null }) {
  const colors = useChartColors();
  return (
    <ChartCard
      title="Gas levels"
      subtitle="ppm · CO₂ on the right axis"
      history={history}
      legend={[
        { label: "CO₂", color: colors["c-co2"] },
        { label: "CH₄", color: colors["c-ch4"] },
        { label: "NH₃", color: colors["c-nh3"] },
        { label: "H₂S", color: colors["c-h2s"] },
      ]}
    >
      {(data, c) => (
        <LineChart data={data} margin={{ top: 4, right: -8, bottom: 0, left: -18 }}>
          <CartesianGrid vertical={false} stroke={c.line} />
          <XAxis dataKey="time" {...axisProps(c)} interval="preserveStartEnd" minTickGap={40} />
          <YAxis yAxisId="small" {...axisProps(c)} width={48} />
          <YAxis yAxisId="co2" orientation="right" {...axisProps(c)} width={48} />
          <Tooltip content={<ChartTooltip units={GAS_UNITS} />} cursor={{ stroke: c.line }} />
          <Line yAxisId="co2" type="monotone" dataKey="co2" stroke={c["c-co2"]} strokeWidth={1.75} dot={false} isAnimationActive={false} />
          <Line yAxisId="small" type="monotone" dataKey="methane" stroke={c["c-ch4"]} strokeWidth={1.5} dot={false} isAnimationActive={false} />
          <Line yAxisId="small" type="monotone" dataKey="ammonia" stroke={c["c-nh3"]} strokeWidth={1.5} dot={false} isAnimationActive={false} />
          <Line yAxisId="small" type="monotone" dataKey="h2s" stroke={c["c-h2s"]} strokeWidth={1.5} dot={false} isAnimationActive={false} />
        </LineChart>
      )}
    </ChartCard>
  );
}
