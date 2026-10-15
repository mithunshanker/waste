"use client";

import { Info } from "lucide-react";
import type { SensorReading } from "@/app/data/mockSensorData";
import type { ParameterStatus } from "@/app/lib/compostLogic";
import {
  getCo2Interpretation, getCo2Status,
  getCh4Interpretation, getCh4Status,
  getNh3Interpretation, getNh3Status,
  getH2sInterpretation, getH2sStatus,
} from "@/app/lib/compostLogic";

interface GasAnalysisProps {
  data: SensorReading;
}

const statusBadge: Record<ParameterStatus, string> = {
  OPTIMAL:  "bg-green-900/60 text-green-300 border-green-700/40",
  LOW:      "bg-amber-900/50 text-amber-300 border-amber-700/40",
  WARNING:  "bg-amber-900/60 text-amber-300 border-amber-700/50",
  CRITICAL: "bg-red-900/60 text-red-300 border-red-700/50",
};

const statusDot: Record<ParameterStatus, string> = {
  OPTIMAL:  "bg-green-400",
  LOW:      "bg-amber-400",
  WARNING:  "bg-amber-400",
  CRITICAL: "bg-red-400",
};

interface GasRow {
  formula: string;
  name: string;
  value: number;
  unit: string;
  status: ParameterStatus;
  interpretation: string;
  valueColor: string;
}

export default function GasAnalysis({ data }: GasAnalysisProps) {
  const rows: GasRow[] = [
    {
      formula: "CO₂",
      name: "Carbon Dioxide",
      value: data.co2,
      unit: "ppm",
      status: getCo2Status(data.co2),
      interpretation: getCo2Interpretation(data.co2),
      valueColor: "text-green-400",
    },
    {
      formula: "CH₄",
      name: "Methane",
      value: data.methane,
      unit: "ppm",
      status: getCh4Status(data.methane),
      interpretation: getCh4Interpretation(data.methane),
      valueColor: "text-amber-400",
    },
    {
      formula: "NH₃",
      name: "Ammonia",
      value: data.ammonia,
      unit: "ppm",
      status: getNh3Status(data.ammonia),
      interpretation: getNh3Interpretation(data.ammonia),
      valueColor: "text-violet-400",
    },
    {
      formula: "H₂S",
      name: "Hydrogen Sulfide",
      value: data.hydrogenSulfide,
      unit: "ppm",
      status: getH2sStatus(data.hydrogenSulfide),
      interpretation: getH2sInterpretation(data.hydrogenSulfide),
      valueColor: "text-red-400",
    },
  ];

  return (
    <div className="rounded-2xl bg-[#0d1f0d]/80 border border-green-800/30 p-5 shadow-xl shadow-black/20">
      {/* Header */}
      <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-100">Gas Analysis</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Real-time gas monitoring — CO₂, CH₄, NH₃, H₂S
          </p>
        </div>
        <div className="flex items-start gap-1.5 px-3 py-2 rounded-lg bg-blue-950/40 border border-blue-800/30 max-w-sm">
          <Info className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
          <p className="text-[10px] text-blue-300/80 leading-relaxed">
            Thresholds here are demonstration values. Calibrate to your actual sensor hardware and composting conditions.
          </p>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left py-2.5 px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Gas</th>
              <th className="text-left py-2.5 px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Reading</th>
              <th className="text-left py-2.5 px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Unit</th>
              <th className="text-left py-2.5 px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="text-left py-2.5 px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Compost Interpretation</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.formula}
                className={`border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors ${
                  i % 2 === 0 ? "bg-white/[0.01]" : ""
                }`}
              >
                <td className="py-3.5 px-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${statusDot[row.status]}`} />
                    <div>
                      <span className="font-bold text-white text-[13px]">{row.formula}</span>
                      <p className="text-[10px] text-slate-500">{row.name}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-3">
                  <span className={`font-mono font-bold text-[15px] ${row.valueColor}`}>
                    {row.value}
                  </span>
                </td>
                <td className="py-3.5 px-3">
                  <span className="text-[12px] text-slate-400 font-mono">{row.unit}</span>
                </td>
                <td className="py-3.5 px-3">
                  <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${statusBadge[row.status]}`}>
                    {row.status}
                  </span>
                </td>
                <td className="py-3.5 px-3">
                  <p className="text-[12px] text-slate-400 leading-relaxed max-w-xs">
                    {row.interpretation}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {rows.map((row) => (
          <div key={row.formula} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${statusDot[row.status]}`} />
                <span className="font-bold text-white">{row.formula}</span>
                <span className="text-[11px] text-slate-500">({row.name})</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${statusBadge[row.status]}`}>
                {row.status}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`font-mono font-bold text-xl ${row.valueColor}`}>{row.value}</span>
              <span className="text-slate-500 text-sm">{row.unit}</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">{row.interpretation}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
