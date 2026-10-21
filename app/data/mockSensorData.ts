// ============================================================
// MOCK SENSOR DATA
// Replace this file's data sources with real REST/WebSocket
// calls when integrating with Arduino/ESP32 hardware.
// ============================================================

export interface SensorReading {
  temperature: number;     // °C
  moisture: number;        // %
  co2: number;             // ppm
  methane: number;         // ppm
  ammonia: number;         // ppm
  hydrogenSulfide: number; // ppm
  initialWeight: number;   // kg
  currentWeight: number;   // kg
  timestamp: Date;
}

export interface HistoricalPoint {
  time: string;
  temperature: number;
  moisture: number;
  weight: number;
  co2: number;
  methane: number;
  ammonia: number;
  h2s: number;
}

export type HistoryRange = "6H" | "24H" | "7D";
export type History = Record<HistoryRange, HistoricalPoint[]>;

// Demo bin metadata shown in the header, intro and sensor info
export const BIN_INFO = {
  id: "CB-07",
  name: "Smart Compost Bin",
  location: "Hostel Block B, Kitchen Yard",
  batch: 7,
  batchDay: 18,
  expectedDays: 45,
  capacityKg: 8,
  device: "ESP32 DevKit v1",
  firmware: "v1.4.2",
  sampleInterval: "4 s",
};

// Sensor thresholds (configurable — adjust for actual hardware)
export const THRESHOLDS = {
  temperature: { low: 35, optimal_low: 45, optimal_high: 65, high: 75 },
  moisture: { low: 40, optimal_low: 50, optimal_high: 70, high: 85 },
  co2: { normal: 2000, warning: 4000, critical: 8000 },       // ppm
  methane: { normal: 20, warning: 50, critical: 100 },         // ppm
  ammonia: { normal: 15, warning: 30, critical: 60 },          // ppm
  hydrogenSulfide: { normal: 2, warning: 5, critical: 10 },    // ppm
};

const INITIAL_WEIGHT = 5.0;

// ─── Deterministic demo model ────────────────────────────────
// Every value is a pure function of "hours ago", so the server and
// client render identical numbers and all chart ranges agree.

// Hash an integer to [-1, 1]
function hash(n: number, seed: number): number {
  let x = (n * 374761393 + seed * 668265263) | 0;
  x = Math.imul(x ^ (x >>> 13), 1274126177);
  x ^= x >>> 16;
  return ((x >>> 0) / 4294967295) * 2 - 1;
}

// Smooth value noise in [-1, 1]
function noise(t: number, seed: number): number {
  const i = Math.floor(t);
  const f = t - i;
  const s = f * f * (3 - 2 * f);
  return hash(i, seed) * (1 - s) + hash(i + 1, seed) * s;
}

const round = (v: number, d: number) => parseFloat(v.toFixed(d));

function sampleAt(h: number) {
  // Thermophilic plateau with a gentle daily cycle, warming up a week ago,
  // and a dip after the pile was turned ~30 h ago.
  const sinceTurn = 30 - h;
  const turnDip = sinceTurn >= 0 ? -7 * Math.exp(-sinceTurn / 4) : 0;
  const warmUp = -Math.max(0, h - 120) * 0.15;
  const temperature =
    58 + 1.8 * Math.sin((2 * Math.PI * h) / 24) + turnDip + warmUp + noise(h * 0.8, 1) * 1.2;

  // Dries out steadily, topped up with water every ~36 h
  const sinceWater = (((15 - h) % 36) + 36) % 36;
  const moisture = 66 - 0.33 * sinceWater + noise(h * 0.6, 2) * 0.8;

  const weight = 3.82 + h * 0.0026 + noise(h * 0.5, 3) * 0.008;
  const co2 = 1450 + (temperature - 58.4) * 60 + noise(h * 0.7, 4) * 80;
  const methane = 12 + (moisture - 61) * 0.6 + noise(h * 0.5, 5) * 2;
  const ammonia = 8 + noise(h * 0.4, 6) * 1.5 + (sinceTurn >= 0 ? 2 * Math.exp(-sinceTurn / 6) : 0);
  const h2s = 1.2 + (methane - 12) * 0.05 + noise(h * 0.9, 7) * 0.15;

  return {
    temperature: round(temperature, 1),
    moisture: round(moisture, 1),
    weight: round(weight, 3),
    co2: Math.round(co2),
    methane: round(Math.max(1, methane), 1),
    ammonia: round(Math.max(1, ammonia), 1),
    h2s: round(Math.max(0.1, h2s), 2),
  };
}

const NOW = sampleAt(0);

// Current "live" reading — replace with API fetch
export const INITIAL_SENSOR_DATA: SensorReading = {
  temperature: NOW.temperature,
  moisture: NOW.moisture,
  co2: NOW.co2,
  methane: NOW.methane,
  ammonia: NOW.ammonia,
  hydrogenSulfide: NOW.h2s,
  initialWeight: INITIAL_WEIGHT,
  currentWeight: round(NOW.weight, 2),
  timestamp: new Date(0),
};

export function formatChartTime(date: Date, range: HistoryRange): string {
  return range === "7D"
    ? date.toLocaleDateString("en-US", { weekday: "short", hour: "numeric" })
    : date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function generateHistory(anchor: Date, range: HistoryRange): HistoricalPoint[] {
  const hours = range === "6H" ? 6 : range === "24H" ? 24 : 168;
  const steps = 48;
  const points: HistoricalPoint[] = [];
  for (let i = steps; i >= 0; i--) {
    const h = (hours * i) / steps;
    const ts = new Date(anchor.getTime() - h * 3600 * 1000);
    points.push({ time: formatChartTime(ts, range), ...sampleAt(h) });
  }
  return points;
}

// Call on the client (labels depend on local time zone)
export function buildHistory(anchor: Date): History {
  return {
    "6H": generateHistory(anchor, "6H"),
    "24H": generateHistory(anchor, "24H"),
    "7D": generateHistory(anchor, "7D"),
  };
}

// Recent guidance log entries
export interface GuidanceLog {
  id: string;
  timestamp: string;
  severity: "good" | "warning" | "critical" | "info";
  title: string;
  message: string;
}

export const INITIAL_GUIDANCE_LOG: GuidanceLog[] = [
  {
    id: "8",
    timestamp: "10:30 AM",
    severity: "good",
    title: "Moisture optimal",
    message: "Moisture is within the optimal range (61%). No watering needed.",
  },
  {
    id: "7",
    timestamp: "09:45 AM",
    severity: "info",
    title: "Thermophilic phase holding",
    message: "Core temperature has stayed between 55–62 °C for 4 days. Pathogen reduction on track.",
  },
  {
    id: "6",
    timestamp: "08:10 AM",
    severity: "good",
    title: "Food waste added",
    message: "0.6 kg of vegetable scraps logged and mixed with 0.3 kg of dry leaves.",
  },
  {
    id: "5",
    timestamp: "Yesterday 9:40 PM",
    severity: "info",
    title: "Moisture topped up",
    message: "Moisture dropped to 53%. 400 ml of water added; reading recovered to 65%.",
  },
  {
    id: "4",
    timestamp: "Yesterday 6:20 PM",
    severity: "warning",
    title: "Aeration recommended",
    message: "CH₄ and NH₃ trending up. Compost was turned; temperature dipped and is recovering.",
  },
  {
    id: "3",
    timestamp: "Yesterday 2:15 PM",
    severity: "info",
    title: "Weight logged",
    message: "Current weight 3.90 kg — 22.0% reduction from 5.00 kg initial.",
  },
  {
    id: "2",
    timestamp: "Mon 11:05 AM",
    severity: "warning",
    title: "Temperature above 65 °C",
    message: "Peak of 66.2 °C recorded. Turning advised to avoid killing beneficial microbes.",
  },
  {
    id: "1",
    timestamp: "Sun 4:30 PM",
    severity: "good",
    title: "Sensors calibrated",
    message: "Moisture probe and load cell re-zeroed. All 6 sensors reporting.",
  },
];
