"use client";

import type { HistoricalPoint } from "@/app/data/mockSensorData";
import { Card, CardTitle } from "@/app/components/ui";

interface DailySummaryProps {
  points: HistoricalPoint[] | null;
}

function stats(points: HistoricalPoint[], key: keyof Omit<HistoricalPoint, "time">) {
  const values = points.map((p) => p[key]);
  const sum = values.reduce((a, b) => a + b, 0);
  return { min: Math.min(...values), max: Math.max(...values), avg: sum / values.length };
}

export default function DailySummary({ points }: DailySummaryProps) {
  const rows = points?.length
    ? (() => {
        const temp = stats(points, "temperature");
        const moist = stats(points, "moisture");
        const co2 = stats(points, "co2");
        const lost = points[0].weight - points[points.length - 1].weight;
        return [
          { label: "Temperature", value: `${temp.avg.toFixed(1)} °C`, range: `${temp.min.toFixed(1)}–${temp.max.toFixed(1)} °C` },
          { label: "Moisture", value: `${moist.avg.toFixed(1)}%`, range: `${moist.min.toFixed(0)}–${moist.max.toFixed(0)}%` },
          { label: "CO₂", value: `${Math.round(co2.avg)} ppm`, range: `${co2.min}–${co2.max} ppm` },
          { label: "Mass lost", value: `${(lost * 1000).toFixed(0)} g`, range: "since yesterday" },
        ];
      })()
    : null;

  return (
    <Card>
      <CardTitle title="Last 24 hours" description="Averages and ranges from the 24H history" />
      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(rows ?? Array.from({ length: 4 }, () => null)).map((r, i) => (
          <div key={r?.label ?? i}>
            {r ? (
              <>
                <dt className="text-xs text-muted">{r.label}</dt>
                <dd className="mt-1 text-lg font-semibold tracking-tight text-fg tabular-nums">{r.value}</dd>
                <dd className="text-xs text-faint tabular-nums">{r.range}</dd>
              </>
            ) : (
              <div className="h-14 rounded-md bg-subtle animate-pulse" />
            )}
          </div>
        ))}
      </dl>
    </Card>
  );
}
