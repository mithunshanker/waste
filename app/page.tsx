"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Thermometer, Droplets, Wind, Weight,
  Flame, CloudRain, AlertCircle, Leaf
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

import {
  INITIAL_SENSOR_DATA,
  INITIAL_GUIDANCE_LOG,
  type SensorReading,
  type GuidanceLog,
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

export default function DashboardPage() {
  const [sensor, setSensor] = useState<SensorReading>(INITIAL_SENSOR_DATA);
  const [prevSensor, setPrevSensor] = useState<SensorReading>(INITIAL_SENSOR_DATA);
  const [guidanceLog, setGuidanceLog] = useState<GuidanceLog[]>(INITIAL_GUIDANCE_LOG);
  const [isLive, setIsLive] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Simulate sensor update
  const updateSensor = useCallback((current: SensorReading): SensorReading => {
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
  }, []);

  // Start/stop simulation interval
  useEffect(() => {
    if (isLive) {
      intervalRef.current = setInterval(() => {
        setSensor((prev) => {
          const next = updateSensor(prev);
          setPrevSensor(prev);
          setLastUpdated(new Date());
          return next;
        });
      }, 4000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isLive, updateSensor]);

  // Mark as done → simulate new reading immediately
  const handleMarkDone = useCallback(() => {
    setSensor((prev) => {
      const next = updateSensor(prev);
      setPrevSensor(prev);
      setLastUpdated(new Date());

      // Add to guidance log
      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const newLog: GuidanceLog = {
        id: String(Date.now()),
        timestamp: timeStr,
        severity: "good",
        title: "Condition Checked",
        message: `Reading confirmed after action. Temp: ${next.temperature}°C, Moisture: ${next.moisture}%.`,
      };
      setGuidanceLog((logs) => [newLog, ...logs.slice(0, 9)]);
      return next;
    });
  }, [updateSensor]);

  const handleRefresh = useCallback(() => {
    setSensor((prev) => {
      const next = updateSensor(prev);
      setPrevSensor(prev);
      setLastUpdated(new Date());
      return next;
    });
  }, [updateSensor]);

  const health = calculateHealthScore(sensor);
  const recommendation = getCompostRecommendation(sensor);
  const weightReduced = sensor.initialWeight - sensor.currentWeight;
  const reductionPct = (weightReduced / sensor.initialWeight) * 100;

  // Trends (current - previous)
  const tempTrend = parseFloat((sensor.temperature - prevSensor.temperature).toFixed(1));
  const moistTrend = parseFloat((sensor.moisture - prevSensor.moisture).toFixed(1));
  const co2Trend = Math.round(sensor.co2 - prevSensor.co2);
  const weightTrend = parseFloat((sensor.currentWeight - prevSensor.currentWeight).toFixed(2));

  return (
    <div className="min-h-screen bg-[#0a150a]">
      <Header
        lastUpdated={lastUpdated}
        isLive={isLive}
        onToggleLive={() => setIsLive((p) => !p)}
      />

      <main className="max-w-[1600px] mx-auto px-4 md:px-6 py-6 space-y-6">

        {/* ── Hero / Project Banner ─────────────────────────────── */}
        <section className="relative overflow-hidden rounded-2xl border border-green-800/40 bg-gradient-to-br from-[#0f2a0f] via-[#0d1f0d] to-[#0a150a] p-6 md:p-8 shadow-2xl shadow-black/40">
          {/* Decorative blob */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-green-600/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-lime-600/8 blur-3xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-600 to-lime-500 flex items-center justify-center shadow-xl shadow-green-900/40 shrink-0">
                <Leaf className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-green-900/60 border border-green-700/40 text-[10px] font-bold text-green-300 uppercase tracking-wider">
                    IoT Environmental Monitoring
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800/60 border border-slate-700/30 text-[10px] text-slate-400">
                    College Project Demo
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">
                  Smart Compost Bin
                </h1>
                <p className="text-sm text-green-400 font-medium mt-0.5">
                  Environmental Monitoring &amp; Intelligent Compost Guidance
                </p>
                <p className="text-[12px] text-slate-400 mt-2 max-w-xl leading-relaxed">
                  An IoT-based compost monitoring system that tracks environmental conditions
                  inside a compost bin and provides real-time guidance to support efficient decomposition.
                </p>
                <div className="flex items-center gap-3 mt-3 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1"><Thermometer className="w-3 h-3" />Temperature</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Droplets className="w-3 h-3" />Moisture</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Wind className="w-3 h-3" />Gas Sensors</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Weight className="w-3 h-3" />Load Cell</span>
                </div>
                <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-600">
                  <span>Arduino</span>
                  <span>•</span>
                  <span>Sensors</span>
                  <span>•</span>
                  <span>Compost Analytics</span>
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-3 shrink-0">
              {[
                { label: "Temperature", value: `${sensor.temperature}°C`, icon: Thermometer, color: "text-red-400" },
                { label: "Moisture", value: `${sensor.moisture}%`, icon: Droplets, color: "text-sky-400" },
                { label: "Weight", value: `${sensor.currentWeight}kg`, icon: Weight, color: "text-lime-400" },
                { label: "Health", value: `${health.score}%`, icon: Leaf, color: "text-green-400" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-white/[0.04] border border-white/8 px-4 py-3 min-w-[110px]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">{item.label}</span>
                  </div>
                  <span className={`text-xl font-black ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Overview Row ─────────────────────────────────────── */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="xl:col-span-1">
            <CompostHealth
              health={health}
              temperature={sensor.temperature}
              moisture={sensor.moisture}
              currentWeight={sensor.currentWeight}
              weightReduction={reductionPct}
            />
          </div>
          <div className="xl:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SensorCard
              id="temp-overview-card"
              icon={Thermometer}
              label="Temperature"
              value={sensor.temperature}
              unit="°C"
              status={getTemperatureStatus(sensor.temperature)}
              trend={tempTrend}
              trendUnit="°C"
              subtitle="Indirect microbial indicator"
              iconColor="text-red-400"
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
              subtitle="Optimal: 50–70%"
              iconColor="text-sky-400"
            />
            <div className="rounded-2xl bg-gradient-to-br from-lime-900/20 via-[#0d1f0d]/80 to-[#0a150a] border border-lime-700/30 p-5 shadow-lg shadow-black/20 card-hover">
              <div className="flex items-start justify-between mb-4">
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Weight className="w-4.5 h-4.5 text-lime-400" size={18} />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-lime-900/60 text-lime-300">
                  ↓ {reductionPct.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-end gap-1.5 mb-1">
                <span className="text-3xl font-black text-lime-400 sensor-value">{sensor.currentWeight.toFixed(2)}</span>
                <span className="text-sm text-slate-400 mb-1">kg</span>
              </div>
              <p className="text-[11px] text-slate-500 mb-3">of {sensor.initialWeight.toFixed(2)} kg initial</p>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Reduced:</span>
                  <span className="text-lime-400 font-bold">{weightReduced.toFixed(2)} kg</span>
                </div>
              </div>
              <div className="flex justify-between mt-3 pt-3 border-t border-white/5">
                <span className="text-[12px] font-semibold text-slate-400 uppercase tracking-wide">Weight</span>
                <span className="text-[11px] text-lime-400 font-mono font-semibold">{weightTrend > 0 ? "+" : ""}{weightTrend} kg</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Sensor Cards Grid ─────────────────────────────────── */}
        <section>
          <h2 className="text-xs font-semibold text-green-500 uppercase tracking-widest mb-3">
            Sensor Readings
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <SensorCard id="temp-card" icon={Thermometer} label="Temperature" value={sensor.temperature} unit="°C"
              status={getTemperatureStatus(sensor.temperature)} trend={tempTrend} trendUnit="°" iconColor="text-red-400" />
            <SensorCard id="moisture-card" icon={Droplets} label="Moisture" value={sensor.moisture} unit="%"
              status={getMoistureStatus(sensor.moisture)} trend={moistTrend} trendUnit="%" iconColor="text-sky-400" />
            <SensorCard id="co2-card" icon={CloudRain} label="CO₂" value={sensor.co2} unit="ppm"
              status={getCo2Status(sensor.co2)} trend={co2Trend} trendUnit=" ppm" iconColor="text-green-400" />
            <SensorCard id="ch4-card" icon={Flame} label="CH₄" value={sensor.methane} unit="ppm"
              status={getCh4Status(sensor.methane)} iconColor="text-amber-400" />
            <SensorCard id="nh3-card" icon={AlertCircle} label="NH₃" value={sensor.ammonia} unit="ppm"
              status={getNh3Status(sensor.ammonia)} iconColor="text-violet-400" />
            <SensorCard id="h2s-card" icon={Wind} label="H₂S" value={sensor.hydrogenSulfide} unit="ppm"
              status={getH2sStatus(sensor.hydrogenSulfide)} iconColor="text-red-400" />
          </div>
        </section>

        {/* ── Charts ────────────────────────────────────────────── */}
        <section>
          <h2 className="text-xs font-semibold text-green-500 uppercase tracking-widest mb-3">
            Historical Trends
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TemperatureChart />
            <MoistureChart />
            <WeightChart />
            <GasChart />
          </div>
        </section>

        {/* ── Main content: Guidance + Microbial ───────────────── */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2">
            <h2 className="text-xs font-semibold text-green-500 uppercase tracking-widest mb-3">
              Smart Compost Guidance
            </h2>
            <SmartGuidance
              recommendation={recommendation}
              guidanceLog={guidanceLog}
              onMarkDone={handleMarkDone}
              onRefresh={handleRefresh}
            />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-green-500 uppercase tracking-widest mb-3">
              Microbial Activity
            </h2>
            <MicrobialActivityCard data={sensor} />
          </div>
        </section>

        {/* ── Gas Analysis ──────────────────────────────────────── */}
        <section>
          <h2 className="text-xs font-semibold text-green-500 uppercase tracking-widest mb-3">
            Gas Analysis
          </h2>
          <GasAnalysis data={sensor} />
        </section>

        {/* ── Compost Progress ──────────────────────────────────── */}
        <section>
          <h2 className="text-xs font-semibold text-green-500 uppercase tracking-widest mb-3">
            Decomposition Progress
          </h2>
          <CompostProgress data={sensor} />
        </section>

        {/* ── Workflow ──────────────────────────────────────────── */}
        <section>
          <h2 className="text-xs font-semibold text-green-500 uppercase tracking-widest mb-3">
            System Architecture
          </h2>
          <SystemWorkflow />
        </section>

        {/* ── Sensor Info ───────────────────────────────────────── */}
        <section>
          <SensorInfo />
        </section>

        {/* ── Footer ────────────────────────────────────────────── */}
        <footer className="py-6 border-t border-green-900/30 text-center">
          <p className="text-[11px] text-slate-600">
            <strong className="text-slate-500">Smart Compost Bin</strong> — Environmental Monitoring Dashboard ·
            Mock data for demonstration · All thresholds are configurable ·
            Designed for IoT integration with Arduino/ESP32
          </p>
        </footer>
      </main>
    </div>
  );
}
