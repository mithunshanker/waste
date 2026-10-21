"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Thermometer, Droplets, Wind, Weight,
  Flame, CloudRain, AlertCircle,
} from "lucide-react";

import Header from "@/app/components/Header";
import CompostHealth from "@/app/components/CompostHealth";
import SensorCard from "@/app/components/SensorCard";
import { TemperatureChart, MoistureChart, WeightChart, GasChart } from "@/app/components/Charts";
import GasAnalysis from "@/app/components/GasAnalysis";
import SmartGuidance from "@/app/components/SmartGuidance";
import CompostProgress from "@/app/components/CompostProgress";
import MicrobialActivityCard from "@/app/components/MicrobialActivity";
import SystemWorkflow from "@/app/components/SystemWorkflow";
import SensorInfo from "@/app/components/SensorInfo";
import DailySummary from "@/app/components/DailySummary";
import { SectionHeader } from "@/app/components/ui";

import {
  BIN_INFO,
  INITIAL_SENSOR_DATA,
  INITIAL_GUIDANCE_LOG,
  buildHistory,
  formatChartTime,
  type SensorReading,
  type GuidanceLog,
  type History,
} from "@/app/data/mockSensorData";

import {
  calculateHealthScore,
  getCompostRecommendation,
  getTemperatureStatus,
  getMoistureStatus,
  getCo2Status,
  getCh4Status,
  getNh3Status,
  getH2sStatus,
} from "@/app/lib/compostLogic";

// Clamp helper
function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

// Small jitter to simulate live sensor fluctuation
function jitter(val: number, range: number, min: number, max: number): number {
  return clamp(val + (Math.random() - 0.5) * range, min, max);
}

// Simulate the next sensor reading
function nextReading(current: SensorReading): SensorReading {
  return {
    ...current,
    temperature: parseFloat(jitter(current.temperature, 1.2, 20, 80).toFixed(1)),
    moisture: parseFloat(jitter(current.moisture, 1.0, 20, 95).toFixed(1)),
    co2: Math.round(jitter(current.co2, 50, 400, 8000)),
    methane: parseFloat(jitter(current.methane, 1.5, 1, 120).toFixed(1)),
    ammonia: parseFloat(jitter(current.ammonia, 1.0, 1, 80).toFixed(1)),
    hydrogenSulfide: parseFloat(jitter(current.hydrogenSulfide, 0.15, 0.1, 12).toFixed(2)),
    currentWeight: parseFloat(Math.max(0.5, current.currentWeight - Math.random() * 0.002).toFixed(2)),
    timestamp: new Date(),
  };
}

const TECH_TAGS = ["Arduino / ESP32", "6 sensors", "Rules-based guidance", "Simulated data"];

export default function DashboardPage() {
  const [sensor, setSensor] = useState<SensorReading>(INITIAL_SENSOR_DATA);
  const [prevSensor, setPrevSensor] = useState<SensorReading>(INITIAL_SENSOR_DATA);
  const [guidanceLog, setGuidanceLog] = useState<GuidanceLog[]>(INITIAL_GUIDANCE_LOG);
  const [history, setHistory] = useState<History | null>(null);
  const [isLive, setIsLive] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(() => new Date());
  const sensorRef = useRef(sensor);

  // History labels depend on the viewer's clock and time zone, so build on the client
  useEffect(() => {
    const id = requestAnimationFrame(() => setHistory(buildHistory(new Date())));
    return () => cancelAnimationFrame(id);
  }, []);

  // Take a new simulated reading and append it to the 6H chart
  const tick = useCallback((): SensorReading => {
    const prev = sensorRef.current;
    const next = nextReading(prev);
    sensorRef.current = next;
    setPrevSensor(prev);
    setSensor(next);
    setLastUpdated(next.timestamp);
    setHistory((h) =>
      h && {
        ...h,
        "6H": [
          ...h["6H"].slice(1),
          {
            time: formatChartTime(next.timestamp, "6H"),
            temperature: next.temperature,
            moisture: next.moisture,
            weight: next.currentWeight,
            co2: next.co2,
            methane: next.methane,
            ammonia: next.ammonia,
            h2s: next.hydrogenSulfide,
          },
        ],
      }
    );
    return next;
  }, []);

  // Start/stop simulation interval
  useEffect(() => {
    if (!isLive) return;
    const id = setInterval(tick, 4000);
    return () => clearInterval(id);
  }, [isLive, tick]);

  // Mark as done → simulate new reading immediately
  const handleMarkDone = useCallback(() => {
    const next = tick();
    const timeStr = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const newLog: GuidanceLog = {
      id: String(Date.now()),
      timestamp: timeStr,
      severity: "good",
      title: "Condition checked",
      message: `Reading confirmed after action. Temp: ${next.temperature} °C, Moisture: ${next.moisture}%.`,
    };
    setGuidanceLog((logs) => [newLog, ...logs.slice(0, 9)]);
  }, [tick]);

  const health = calculateHealthScore(sensor);
  const recommendation = getCompostRecommendation(sensor);
  const weightReduced = sensor.initialWeight - sensor.currentWeight;
  const reductionPct = (weightReduced / sensor.initialWeight) * 100;
  const batchPct = (BIN_INFO.batchDay / BIN_INFO.expectedDays) * 100;

  // Trends (current - previous)
  const tempTrend = parseFloat((sensor.temperature - prevSensor.temperature).toFixed(1));
  const moistTrend = parseFloat((sensor.moisture - prevSensor.moisture).toFixed(1));
  const co2Trend = Math.round(sensor.co2 - prevSensor.co2);
  const weightTrend = parseFloat((sensor.currentWeight - prevSensor.currentWeight).toFixed(2));

  return (
    <div className="min-h-screen">
      <Header
        lastUpdated={lastUpdated}
        isLive={isLive}
        onToggleLive={() => setIsLive((p) => !p)}
      />

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-10 space-y-12">

        {/* ── Intro ─────────────────────────────────────────────── */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs font-medium text-accent mb-2">IoT environmental monitoring</p>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-fg">
              Smart Compost Bin
            </h1>
            <p className="text-sm md:text-base text-muted mt-2 leading-relaxed">
              Tracks temperature, moisture, gases and weight inside a compost bin, and gives real-time
              guidance to keep decomposition efficient.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {TECH_TAGS.map((t) => (
                <span key={t} className="px-2.5 py-1 rounded-md border border-line text-xs text-muted">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="md:w-64 shrink-0">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-muted">Batch #{BIN_INFO.batch}</span>
              <span className="text-fg font-medium tabular-nums">
                Day {BIN_INFO.batchDay} of ~{BIN_INFO.expectedDays}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-subtle overflow-hidden">
              <div className="h-full rounded-full bg-accent" style={{ width: `${batchPct}%` }} />
            </div>
          </div>
        </section>

        {/* ── Overview ──────────────────────────────────────────── */}
        <section>
          <SectionHeader title="Overview" description="Current state of the bin at a glance" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <CompostHealth
              health={health}
              temperature={sensor.temperature}
              moisture={sensor.moisture}
              currentWeight={sensor.currentWeight}
              weightReduction={reductionPct}
            />
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 content-start min-w-0">
              <SensorCard
                id="temp-overview-card"
                icon={Thermometer}
                label="Temperature"
                value={sensor.temperature}
                unit="°C"
                status={getTemperatureStatus(sensor.temperature)}
                trend={tempTrend}
                trendUnit=" °C"
                subtitle="Optimal 45–65 °C"
              />
              <SensorCard
                id="moisture-overview-card"
                icon={Droplets}
                label="Moisture"
                value={sensor.moisture}
                unit="%"
                status={getMoistureStatus(sensor.moisture)}
                trend={moistTrend}
                trendUnit="%"
                subtitle="Optimal 50–70%"
              />
              <SensorCard
                id="weight-overview-card"
                icon={Weight}
                label="Weight"
                value={sensor.currentWeight.toFixed(2)}
                unit="kg"
                badge={<span className="text-xs font-medium text-accent tabular-nums">−{reductionPct.toFixed(1)}%</span>}
                trend={weightTrend}
                trendUnit=" kg"
                subtitle={`of ${sensor.initialWeight.toFixed(2)} kg initial`}
              />
              <div className="sm:col-span-3">
                <DailySummary points={history?.["24H"] ?? null} />
              </div>
            </div>
          </div>
        </section>

        {/* ── Sensor readings ───────────────────────────────────── */}
        <section>
          <SectionHeader title="Sensor readings" description={`Live values, refreshed every ${BIN_INFO.sampleInterval}`} />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <SensorCard size="sm" id="temp-card" icon={Thermometer} label="Temperature" value={sensor.temperature} unit="°C"
              status={getTemperatureStatus(sensor.temperature)} trend={tempTrend} trendUnit="°" />
            <SensorCard size="sm" id="moisture-card" icon={Droplets} label="Moisture" value={sensor.moisture} unit="%"
              status={getMoistureStatus(sensor.moisture)} trend={moistTrend} trendUnit="%" />
            <SensorCard size="sm" id="co2-card" icon={CloudRain} label="CO₂" value={sensor.co2} unit="ppm"
              status={getCo2Status(sensor.co2)} trend={co2Trend} />
            <SensorCard size="sm" id="ch4-card" icon={Flame} label="CH₄" value={sensor.methane} unit="ppm"
              status={getCh4Status(sensor.methane)} />
            <SensorCard size="sm" id="nh3-card" icon={AlertCircle} label="NH₃" value={sensor.ammonia} unit="ppm"
              status={getNh3Status(sensor.ammonia)} />
            <SensorCard size="sm" id="h2s-card" icon={Wind} label="H₂S" value={sensor.hydrogenSulfide} unit="ppm"
              status={getH2sStatus(sensor.hydrogenSulfide)} />
          </div>
        </section>

        {/* ── Charts ────────────────────────────────────────────── */}
        <section>
          <SectionHeader title="Historical trends" description="Last 6 hours, 24 hours or 7 days" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TemperatureChart history={history} />
            <MoistureChart history={history} />
            <WeightChart history={history} />
            <GasChart history={history} />
          </div>
        </section>

        {/* ── Guidance + Microbial ──────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 min-w-0">
            <SectionHeader title="Smart guidance" description="What to do next, based on current readings" />
            <SmartGuidance
              recommendation={recommendation}
              guidanceLog={guidanceLog}
              onMarkDone={handleMarkDone}
              onRefresh={tick}
            />
          </div>
          <div className="min-w-0">
            <SectionHeader title="Microbial activity" description="Estimated biological activity" />
            <div className="lg:sticky lg:top-20">
              <MicrobialActivityCard data={sensor} />
            </div>
          </div>
        </section>

        {/* ── Gas Analysis ──────────────────────────────────────── */}
        <section>
          <SectionHeader title="Gas analysis" description="CO₂, CH₄, NH₃ and H₂S with interpretation" />
          <GasAnalysis data={sensor} />
        </section>

        {/* ── Compost Progress ──────────────────────────────────── */}
        <section>
          <SectionHeader title="Decomposition progress" description="How far along this batch is" />
          <CompostProgress data={sensor} />
        </section>

        {/* ── Workflow ──────────────────────────────────────────── */}
        <section>
          <SectionHeader title="System architecture" />
          <SystemWorkflow />
        </section>

        {/* ── Sensor Info ───────────────────────────────────────── */}
        <section>
          <SensorInfo />
        </section>

        {/* ── Footer ────────────────────────────────────────────── */}
        <footer className="pt-6 border-t border-line flex flex-col sm:flex-row justify-between gap-2 text-xs text-faint">
          <span>Smart Compost Bin · Environmental monitoring dashboard</span>
          <span>Demo mode, simulated sensor data</span>
        </footer>
      </main>
    </div>
  );
}
