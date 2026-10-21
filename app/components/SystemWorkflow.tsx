"use client";

import { Trash2, Zap, Wifi, Cpu, Monitor, Lightbulb } from "lucide-react";
import { Card, CardTitle } from "@/app/components/ui";

const STEPS = [
  {
    icon: Trash2,
    title: "Waste added",
    desc: "Kitchen or garden organic waste goes into the bin.",
  },
  {
    icon: Zap,
    title: "Decomposition",
    desc: "Microorganisms break down organic matter under suitable conditions.",
  },
  {
    icon: Wifi,
    title: "Sensors collect data",
    desc: "Temperature, moisture, gas and weight are measured continuously.",
  },
  {
    icon: Cpu,
    title: "Microcontroller",
    desc: "The Arduino/ESP32 reads sensor values and does initial processing.",
  },
  {
    icon: Monitor,
    title: "Dashboard",
    desc: "Readings are shown here along with historical charts.",
  },
  {
    icon: Lightbulb,
    title: "Smart guidance",
    desc: "The system interprets the data and recommends actions.",
  },
] as const;

const LOOP = ["Sensor data", "Analysis", "Recommendation", "User action", "Next check", "Confirmation"];

export default function SystemWorkflow() {
  return (
    <Card>
      <CardTitle title="How the system works" description="From organic waste in to guidance out" />

      <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-x-4 gap-y-5">
        {STEPS.map((step, idx) => (
          <li key={step.title} className="relative flex lg:flex-col gap-3">
            {idx < STEPS.length - 1 && (
              <span className="hidden lg:block absolute top-4 left-10 right-0 h-px bg-line" />
            )}
            <span className="relative z-10 w-8 h-8 rounded-lg border border-line bg-card flex items-center justify-center shrink-0">
              <step.icon className="w-4 h-4 text-muted" />
            </span>
            <div>
              <p className="text-sm font-medium text-fg">
                <span className="text-faint tabular-nums mr-1.5">{idx + 1}</span>
                {step.title}
              </p>
              <p className="text-xs text-muted leading-relaxed mt-1">{step.desc}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-6 pt-4 border-t border-line flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
        {LOOP.map((s, i) => (
          <span key={s} className="inline-flex items-center gap-2">
            <span className={i === LOOP.length - 1 ? "text-accent font-medium" : ""}>{s}</span>
            {i < LOOP.length - 1 && <span className="text-faint">→</span>}
          </span>
        ))}
      </div>
    </Card>
  );
}
