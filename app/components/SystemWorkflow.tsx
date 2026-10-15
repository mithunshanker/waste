"use client";

import { Trash2, Zap, Wifi, Cpu, Monitor, Lightbulb } from "lucide-react";

const STEPS = [
  {
    id: 1,
    icon: Trash2,
    title: "Organic Waste Added",
    desc: "Kitchen/garden organic waste is placed in the compost bin.",
    color: "text-lime-400",
    bg: "bg-lime-900/30 border-lime-700/40",
    glow: "shadow-lime-900/20",
  },
  {
    id: 2,
    icon: Zap,
    title: "Microbial Decomposition",
    desc: "Microorganisms begin breaking down organic matter under suitable conditions.",
    color: "text-green-400",
    bg: "bg-green-900/30 border-green-700/40",
    glow: "shadow-green-900/20",
  },
  {
    id: 3,
    icon: Wifi,
    title: "Sensors Collect Data",
    desc: "Temperature, moisture, gas, and weight sensors monitor the compost continuously.",
    color: "text-cyan-400",
    bg: "bg-cyan-900/30 border-cyan-700/40",
    glow: "shadow-cyan-900/20",
  },
  {
    id: 4,
    icon: Cpu,
    title: "Arduino Processes Data",
    desc: "The Arduino microcontroller reads sensor values and performs initial processing.",
    color: "text-violet-400",
    bg: "bg-violet-900/30 border-violet-700/40",
    glow: "shadow-violet-900/20",
  },
  {
    id: 5,
    icon: Monitor,
    title: "Dashboard Displays Data",
    desc: "Processed readings are shown on this dashboard with historical charts.",
    color: "text-sky-400",
    bg: "bg-sky-900/30 border-sky-700/40",
    glow: "shadow-sky-900/20",
  },
  {
    id: 6,
    icon: Lightbulb,
    title: "Smart Guidance",
    desc: "The system interprets the data and provides actionable recommendations.",
    color: "text-amber-400",
    bg: "bg-amber-900/30 border-amber-700/40",
    glow: "shadow-amber-900/20",
  },
] as const;

export default function SystemWorkflow() {
  return (
    <div className="rounded-2xl bg-[#0d1f0d]/80 border border-green-800/30 p-5 shadow-xl shadow-black/20">
      <div className="mb-5">
        <h2 className="text-sm font-bold text-slate-100 mb-1">How the System Works</h2>
        <p className="text-[11px] text-slate-500">
          End-to-end workflow from organic waste input to smart guidance output
        </p>
      </div>

      {/* Steps */}
      <div className="relative">
        {/* Connector line — desktop horizontal */}
        <div className="hidden lg:block absolute top-10 left-10 right-10 h-0.5 bg-gradient-to-r from-lime-700/30 via-green-700/30 to-amber-700/30" />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {STEPS.map((step, idx) => (
            <div key={step.id} className="relative flex flex-col items-center text-center group">
              {/* Arrow between steps (mobile/tablet) */}
              {idx < STEPS.length - 1 && (
                <div className="lg:hidden absolute -right-2 top-8 text-slate-700 text-sm font-bold z-10">
                  →
                </div>
              )}

              {/* Icon circle */}
              <div
                className={`
                  w-[52px] h-[52px] rounded-2xl flex items-center justify-center border mb-3
                  ${step.bg} shadow-lg ${step.glow}
                  group-hover:scale-110 transition-transform duration-200
                `}
              >
                <step.icon className={`w-5 h-5 ${step.color}`} />
              </div>

              {/* Step number */}
              <div className="absolute -top-1 -right-1 lg:top-auto lg:-right-auto w-5 h-5 rounded-full bg-[#0a150a] border border-slate-700 flex items-center justify-center">
                <span className="text-[9px] font-bold text-slate-400">{step.id}</span>
              </div>

              <h3 className={`text-[12px] font-bold mb-1 ${step.color}`}>{step.title}</h3>
              <p className="text-[10px] text-slate-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Loop hint */}
      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-center gap-3 text-[11px] text-slate-600">
        <span>Sensor Data</span>
        <span className="text-slate-700">→</span>
        <span>Condition Analysis</span>
        <span className="text-slate-700">→</span>
        <span>Recommendation</span>
        <span className="text-slate-700">→</span>
        <span>User Action</span>
        <span className="text-slate-700">→</span>
        <span>Next Check</span>
        <span className="text-slate-700">→</span>
        <span className="text-green-500">Confirmation</span>
      </div>
    </div>
  );
}
