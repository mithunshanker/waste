"use client";

import { Info } from "lucide-react";
import type { SensorReading } from "@/app/data/mockSensorData";
import { getDecompositionStage } from "@/app/lib/compostLogic";

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

  return (
    <div className="rounded-2xl bg-[#0d1f0d]/80 border border-green-800/30 p-5 shadow-xl shadow-black/20">
      <h2 className="text-sm font-bold text-slate-100 mb-1">Compost Progress</h2>
      <p className="text-[11px] text-slate-500 mb-5">
        Weight-based decomposition tracking
      </p>

      {/* Weight stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Initial Weight", value: `${data.initialWeight.toFixed(2)} kg`, sub: "Starting mass" },
          { label: "Current Weight", value: `${data.currentWeight.toFixed(2)} kg`, sub: "Current mass", highlight: true },
          { label: "Weight Reduced", value: `${weightReduced.toFixed(2)} kg`, sub: "Mass loss" },
          { label: "Reduction", value: `${reductionPct.toFixed(1)}%`, sub: "Of initial", highlight: true },
        ].map((item) => (
          <div
            key={item.label}
            className={`rounded-xl p-3 border ${
              item.highlight
                ? "border-green-700/40 bg-green-900/20"
                : "border-white/5 bg-white/[0.02]"
            }`}
          >
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{item.label}</p>
            <p className={`text-lg font-black ${item.highlight ? "text-green-400" : "text-slate-200"}`}>
              {item.value}
            </p>
            <p className="text-[10px] text-slate-600 mt-0.5">{item.sub}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mb-5">
        <div className="flex justify-between text-[11px] text-slate-400 mb-1.5">
          <span>0 kg</span>
          <span className="font-bold text-green-400">{reductionPct.toFixed(1)}% reduced</span>
          <span>{data.initialWeight.toFixed(2)} kg</span>
        </div>
        <div className="h-3 rounded-full bg-slate-800/60 border border-slate-700/30 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-green-600 to-lime-400 transition-all duration-1000 ease-out relative"
            style={{ width: `${Math.min(reductionPct, 100)}%` }}
          >
            <div className="absolute inset-0 bg-white/10 rounded-full" />
          </div>
        </div>
      </div>

      {/* Stage tracker */}
      <div className="mb-4">
        <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-3 font-semibold">
          Decomposition Stage
        </p>
        <div className="relative">
          {/* Connector line */}
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-800" />
          <div
            className="absolute top-4 left-4 h-0.5 bg-gradient-to-r from-green-600 to-lime-400 transition-all duration-700"
            style={{ width: `calc(${(stageIndex / (STAGES.length - 1)) * 100}% - 8px)` }}
          />

          <div className="relative flex justify-between">
            {STAGES.map((s, idx) => {
              const isActive = idx === stageIndex;
              const isPast = idx < stageIndex;
              return (
                <div key={s} className="flex flex-col items-center gap-1.5" style={{ width: "20%" }}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-[10px] font-bold transition-all ${
                      isActive
                        ? "border-green-400 bg-green-900/60 text-green-300 shadow-md shadow-green-900/30 scale-110"
                        : isPast
                        ? "border-green-700 bg-green-900/30 text-green-500"
                        : "border-slate-700 bg-slate-800/40 text-slate-600"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <p
                    className={`text-[9px] text-center leading-tight font-medium hidden sm:block ${
                      isActive ? "text-green-300" : isPast ? "text-slate-500" : "text-slate-600"
                    }`}
                  >
                    {s}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
        <p className="mt-4 text-center text-sm font-bold text-green-400">
          Current: {stage}
        </p>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-950/30 border border-blue-800/30">
        <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-blue-300/80 leading-relaxed">
          Weight reduction indicates material loss and decomposition progress, but <strong>does not alone confirm compost maturity</strong>. Temperature, moisture, and gas conditions should all be considered.
        </p>
      </div>
    </div>
  );
}
