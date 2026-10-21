"use client";

import { useEffect, useState } from "react";
import type { ParameterStatus } from "@/app/lib/compostLogic";

// ─── Status tones ─────────────────────────────────────────────

export type Tone = "ok" | "warn" | "bad" | "info" | "neutral";

const toneDot: Record<Tone, string> = {
  ok: "bg-ok",
  warn: "bg-warn",
  bad: "bg-bad",
  info: "bg-info",
  neutral: "bg-faint",
};

const toneText: Record<Tone, string> = {
  ok: "text-ok",
  warn: "text-warn",
  bad: "text-bad",
  info: "text-info",
  neutral: "text-muted",
};

export function statusTone(status: ParameterStatus): Tone {
  switch (status) {
    case "OPTIMAL": return "ok";
    case "LOW":
    case "WARNING": return "warn";
    case "CRITICAL": return "bad";
  }
}

export const statusLabel: Record<ParameterStatus, string> = {
  OPTIMAL: "Optimal",
  LOW: "Low",
  WARNING: "Warning",
  CRITICAL: "Critical",
};

export function toneTextClass(tone: Tone) {
  return toneText[tone];
}

export function Dot({ tone, className = "" }: { tone: Tone; className?: string }) {
  return <span className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${toneDot[tone]} ${className}`} />;
}

export function StatusDot({ tone, label }: { tone: Tone; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${toneText[tone]}`}>
      <Dot tone={tone} />
      {label}
    </span>
  );
}

export function ParamStatus({ status }: { status: ParameterStatus }) {
  return <StatusDot tone={statusTone(status)} label={statusLabel[status]} />;
}

// ─── Layout ───────────────────────────────────────────────────

export function Card({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
}) {
  return <Tag className={`rounded-xl border border-line bg-card p-5 ${className}`}>{children}</Tag>;
}

export function CardTitle({
  title,
  description,
  right,
}: {
  title: string;
  description?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 mb-4">
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-fg">{title}</h3>
        {description && <p className="text-xs text-muted mt-0.5">{description}</p>}
      </div>
      {right}
    </div>
  );
}

export function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-semibold text-fg tracking-tight">{title}</h2>
      {description && <p className="text-sm text-muted mt-0.5">{description}</p>}
    </div>
  );
}

export function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs text-muted leading-relaxed border-l-2 border-line pl-3">{children}</p>
  );
}

export function ProgressBar({ value, className = "" }: { value: number; className?: string }) {
  return (
    <div className={`h-1.5 rounded-full bg-subtle overflow-hidden ${className}`}>
      <div
        className="h-full rounded-full bg-accent transition-[width] duration-700 ease-out"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

// ─── Chart colours (follow light/dark mode) ──────────────────

const CHART_VARS = [
  "line", "muted", "faint", "card", "fg", "accent", "warn", "subtle",
  "c-temp", "c-moist", "c-weight", "c-co2", "c-ch4", "c-nh3", "c-h2s",
] as const;

export type ChartColors = Record<(typeof CHART_VARS)[number], string>;

const LIGHT_FALLBACK: ChartColors = {
  line: "#e7e5e4", muted: "#78716c", faint: "#a8a29e", card: "#ffffff", fg: "#1c1917",
  accent: "#16a34a", warn: "#d97706", subtle: "#f5f5f4",
  "c-temp": "#ea580c", "c-moist": "#0284c7", "c-weight": "#16a34a",
  "c-co2": "#16a34a", "c-ch4": "#d97706", "c-nh3": "#7c3aed", "c-h2s": "#e11d48",
};

export function useChartColors(): ChartColors {
  const [colors, setColors] = useState<ChartColors>(LIGHT_FALLBACK);

  useEffect(() => {
    const read = () => {
      const style = getComputedStyle(document.documentElement);
      const next = { ...LIGHT_FALLBACK };
      for (const key of CHART_VARS) {
        const v = style.getPropertyValue(`--${key}`).trim();
        if (v) next[key] = v;
      }
      setColors(next);
    };
    read();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", read);
    return () => mq.removeEventListener("change", read);
  }, []);

  return colors;
}
