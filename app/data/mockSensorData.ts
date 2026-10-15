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

// Current "live" reading — replace with API fetch
export const INITIAL_SENSOR_DATA: SensorReading = {
  temperature: 58.4,
  moisture: 61,
  co2: 1450,
  methane: 12,
  ammonia: 8,
  hydrogenSulfide: 1.2,
  initialWeight: 5.0,
  currentWeight: 3.82,
  timestamp: new Date(),
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

// Generate realistic historical data
function generateHistory(hours: number): HistoricalPoint[] {
  const points: HistoricalPoint[] = [];
  const now = Date.now();
  const intervalMs = (hours * 60 * 60 * 1000) / 48; // 48 data points each range

  let temp = 52;
  let moisture = 58;
  let weight = 4.1;
  let co2 = 1200;
  let methane = 10;
  let ammonia = 6;
  let h2s = 1.0;

  for (let i = 48; i >= 0; i--) {
    const ts = new Date(now - i * intervalMs);
    const label =
      hours <= 6
        ? ts.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
        : hours <= 24
        ? ts.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
        : ts.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit" });

    // Simulate realistic fluctuations
    temp = Math.max(40, Math.min(72, temp + (Math.random() - 0.46) * 1.8));
    moisture = Math.max(38, Math.min(80, moisture + (Math.random() - 0.5) * 1.5));
    weight = Math.max(3.5, weight - Math.random() * 0.008);
    co2 = Math.max(800, Math.min(3500, co2 + (Math.random() - 0.5) * 80));
    methane = Math.max(5, Math.min(35, methane + (Math.random() - 0.5) * 2));
    ammonia = Math.max(3, Math.min(25, ammonia + (Math.random() - 0.5) * 1.5));
    h2s = Math.max(0.3, Math.min(4, h2s + (Math.random() - 0.5) * 0.2));

    points.push({
      time: label,
      temperature: parseFloat(temp.toFixed(1)),
      moisture: parseFloat(moisture.toFixed(1)),
      weight: parseFloat(weight.toFixed(2)),
      co2: Math.round(co2),
      methane: parseFloat(methane.toFixed(1)),
      ammonia: parseFloat(ammonia.toFixed(1)),
      h2s: parseFloat(h2s.toFixed(2)),
    });
  }

  return points;
}

export const HISTORY_6H = generateHistory(6);
export const HISTORY_24H = generateHistory(24);
export const HISTORY_7D = generateHistory(168);

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
    id: "1",
    timestamp: "10:30 AM",
    severity: "good",
    title: "Moisture Optimal",
    message: "Moisture is within the optimal range (61%). Conditions look good.",
  },
  {
    id: "2",
    timestamp: "09:45 AM",
    severity: "warning",
    title: "Temperature Rising",
    message: "Temperature elevated above 65°C. Monitor closely and consider turning the compost.",
  },
  {
    id: "3",
    timestamp: "08:30 AM",
    severity: "good",
    title: "Temperature Stable",
    message: "Microbial activity remains active. Decomposition proceeding well.",
  },
  {
    id: "4",
    timestamp: "Yesterday 6:20 PM",
    severity: "warning",
    title: "Aeration Recommended",
    message: "Gas readings suggest reduced oxygen availability. Turn compost to improve aeration.",
  },
  {
    id: "5",
    timestamp: "Yesterday 2:15 PM",
    severity: "info",
    title: "Weight Logged",
    message: "Current weight: 3.90 kg. Decomposition reduction: 22.0%.",
  },
];
