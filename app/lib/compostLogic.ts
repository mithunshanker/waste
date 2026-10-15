// ============================================================
// COMPOST LOGIC / RULES ENGINE
// All scoring and recommendation logic lives here so it can
// be replaced by a backend API call without touching UI code.
// ============================================================

import { SensorReading, THRESHOLDS } from "@/app/data/mockSensorData";

// ─── Types ───────────────────────────────────────────────────

export type Severity = "good" | "info" | "warning" | "critical";

export interface Recommendation {
  severity: Severity;
  title: string;
  message: string;
  action: string;
}

export type ParameterStatus = "OPTIMAL" | "WARNING" | "CRITICAL" | "LOW";

export interface HealthScore {
  score: number;           // 0–100
  label: string;
  temperatureStatus: ParameterStatus;
  moistureStatus: ParameterStatus;
  gasStatus: ParameterStatus;
  weightStatus: ParameterStatus;
}

export type MicrobialLevel = "HIGH" | "MODERATE" | "LOW";
export type DecompositionStage =
  | "Fresh Waste"
  | "Initial Decomposition"
  | "Active Decomposition"
  | "Maturation"
  | "Ready";

// ─── Parameter Status Helpers ────────────────────────────────

export function getTemperatureStatus(temp: number): ParameterStatus {
  const t = THRESHOLDS.temperature;
  if (temp < t.low) return "CRITICAL";
  if (temp < t.optimal_low) return "LOW";
  if (temp > t.high) return "CRITICAL";
  if (temp > t.optimal_high) return "WARNING";
  return "OPTIMAL";
}

export function getMoistureStatus(moisture: number): ParameterStatus {
  const m = THRESHOLDS.moisture;
  if (moisture < m.low) return "CRITICAL";
  if (moisture < m.optimal_low) return "LOW";
  if (moisture > m.high) return "CRITICAL";
  if (moisture > m.optimal_high) return "WARNING";
  return "OPTIMAL";
}

export function getGasStatus(data: SensorReading): ParameterStatus {
  const t = THRESHOLDS;
  if (
    data.co2 > t.co2.critical ||
    data.methane > t.methane.critical ||
    data.ammonia > t.ammonia.critical ||
    data.hydrogenSulfide > t.hydrogenSulfide.critical
  )
    return "CRITICAL";
  if (
    data.co2 > t.co2.warning ||
    data.methane > t.methane.warning ||
    data.ammonia > t.ammonia.warning ||
    data.hydrogenSulfide > t.hydrogenSulfide.warning
  )
    return "WARNING";
  return "OPTIMAL";
}

export function getWeightStatus(data: SensorReading): ParameterStatus {
  const reduction =
    ((data.initialWeight - data.currentWeight) / data.initialWeight) * 100;
  if (reduction < 5) return "LOW";
  if (reduction > 80) return "WARNING"; // unusually high — recheck
  return "OPTIMAL";
}

// ─── Health Score ─────────────────────────────────────────────

export function calculateHealthScore(data: SensorReading): HealthScore {
  const tempStatus = getTemperatureStatus(data.temperature);
  const moistureStatus = getMoistureStatus(data.moisture);
  const gasStatus = getGasStatus(data);
  const weightStatus = getWeightStatus(data);

  const score = (status: ParameterStatus): number => {
    switch (status) {
      case "OPTIMAL": return 25;
      case "LOW":     return 18;
      case "WARNING": return 12;
      case "CRITICAL": return 0;
    }
  };

  const total =
    score(tempStatus) + score(moistureStatus) + score(gasStatus) + score(weightStatus);

  const label =
    total >= 90
      ? "EXCELLENT"
      : total >= 70
      ? "OPTIMAL CONDITION"
      : total >= 50
      ? "FAIR CONDITION"
      : total >= 30
      ? "NEEDS ATTENTION"
      : "CRITICAL";

  return {
    score: total,
    label,
    temperatureStatus: tempStatus,
    moistureStatus,
    gasStatus,
    weightStatus,
  };
}

// ─── Microbial Activity ───────────────────────────────────────

export function getMicrobialActivity(temperature: number): MicrobialLevel {
  if (temperature >= 50) return "HIGH";
  if (temperature >= 35) return "MODERATE";
  return "LOW";
}

// ─── Decomposition Stage ──────────────────────────────────────

export function getDecompositionStage(data: SensorReading): DecompositionStage {
  const reduction =
    ((data.initialWeight - data.currentWeight) / data.initialWeight) * 100;
  const temp = data.temperature;

  if (reduction < 5 && temp < 35) return "Fresh Waste";
  if (reduction < 10 && temp < 45) return "Initial Decomposition";
  if (temp >= 45 && temp <= 70 && reduction >= 10) return "Active Decomposition";
  if (reduction >= 40 && temp < 45) return "Maturation";
  if (reduction >= 60 && temp < 35) return "Ready";
  return "Active Decomposition";
}

// ─── Smart Recommendation Rules Engine ───────────────────────
// Replace getCompostRecommendation() with an API call later.

export function getCompostRecommendation(data: SensorReading): Recommendation {
  const t = THRESHOLDS;

  // Critical gas checks first
  if (data.hydrogenSulfide > t.hydrogenSulfide.warning) {
    return {
      severity: "critical",
      title: "Anaerobic Conditions Detected",
      message: `H₂S reading is ${data.hydrogenSulfide} ppm — elevated. This may indicate anaerobic decomposition and poor aeration.`,
      action:
        "Turn and aerate the compost immediately to introduce oxygen and reduce anaerobic activity.",
    };
  }

  if (data.methane > t.methane.warning) {
    return {
      severity: "critical",
      title: "Elevated Methane Detected",
      message: `CH₄ reading is ${data.methane} ppm — above the normal range. This may indicate anaerobic conditions within the compost.`,
      action:
        "Improve aeration by turning the compost. Ensure proper moisture balance to avoid compaction.",
    };
  }

  if (data.ammonia > t.ammonia.warning) {
    return {
      severity: "warning",
      title: "Elevated Ammonia Detected",
      message: `NH₃ reading is ${data.ammonia} ppm. Elevated ammonia may indicate excessive nitrogen-rich material or an imbalance in the carbon/nitrogen ratio.`,
      action:
        "Add carbon-rich materials (dry leaves, cardboard) to balance the nitrogen content and turn the compost.",
    };
  }

  // Temperature checks
  if (data.temperature < t.temperature.low) {
    return {
      severity: "warning",
      title: "Low Temperature — Microbial Activity May Be Slow",
      message: `Temperature is ${data.temperature}°C, which is below the active composting range. Microbial activity may have slowed.`,
      action:
        "Check moisture levels, improve aeration, and review the carbon/nitrogen balance. Consider insulating the bin.",
    };
  }

  if (data.temperature > t.temperature.high) {
    return {
      severity: "warning",
      title: "Temperature Elevated",
      message: `Temperature is ${data.temperature}°C — above the recommended range for sustained microbial activity.`,
      action:
        "Turn and aerate the compost to release heat. Monitor the temperature over the next few hours.",
    };
  }

  // Moisture checks
  if (data.moisture < t.moisture.low) {
    return {
      severity: "warning",
      title: "Moisture Too Low",
      message: `Moisture is ${data.moisture}%, which is below the optimal range (${t.moisture.optimal_low}–${t.moisture.optimal_high}%).`,
      action:
        "Add a small amount of water and mix the compost thoroughly to distribute moisture evenly.",
    };
  }

  if (data.moisture > t.moisture.high) {
    return {
      severity: "warning",
      title: "Moisture Too High",
      message: `Moisture is ${data.moisture}%, which is above the optimal range. Excess moisture can restrict oxygen flow and promote anaerobic conditions.`,
      action:
        "Add dry carbon-rich material (straw, dry leaves) and turn the compost to improve aeration.",
    };
  }

  // All conditions look good
  return {
    severity: "good",
    title: "Compost Conditions Stable",
    message: `All monitored parameters are within acceptable ranges. Temperature ${data.temperature}°C, Moisture ${data.moisture}%, gas levels normal.`,
    action:
      "No immediate action required. Continue regular monitoring. Consider logging today's readings.",
  };
}

// ─── CO₂ Gas Interpretation ──────────────────────────────────

export function getCo2Interpretation(ppm: number): string {
  if (ppm < 400) return "Below ambient levels — very low microbial respiratory activity.";
  if (ppm < 1000) return "Slightly elevated — low microbial activity or good ventilation.";
  if (ppm < 2000) return "Moderate — indicates active microbial respiration.";
  if (ppm < 4000) return "Elevated — high microbial activity; monitor ventilation.";
  return "High — possible restricted airflow; aeration may be needed.";
}

export function getCo2Status(ppm: number): ParameterStatus {
  if (ppm > THRESHOLDS.co2.critical) return "CRITICAL";
  if (ppm > THRESHOLDS.co2.warning) return "WARNING";
  return "OPTIMAL";
}

export function getCh4Interpretation(ppm: number): string {
  if (ppm < 5) return "Trace levels — minimal anaerobic activity.";
  if (ppm < 20) return "Low — normal for active compost; monitor trend.";
  if (ppm < 50) return "Moderate — may indicate some anaerobic zones; improve aeration.";
  return "Elevated — possible anaerobic conditions; aeration recommended.";
}

export function getCh4Status(ppm: number): ParameterStatus {
  if (ppm > THRESHOLDS.methane.critical) return "CRITICAL";
  if (ppm > THRESHOLDS.methane.warning) return "WARNING";
  return "OPTIMAL";
}

export function getNh3Interpretation(ppm: number): string {
  if (ppm < 5) return "Low — balanced nitrogen content.";
  if (ppm < 15) return "Normal — acceptable nitrogen decomposition.";
  if (ppm < 30) return "Elevated — possible excess nitrogen-rich material; check C/N ratio.";
  return "High — nitrogen imbalance likely; add carbon-rich materials.";
}

export function getNh3Status(ppm: number): ParameterStatus {
  if (ppm > THRESHOLDS.ammonia.critical) return "CRITICAL";
  if (ppm > THRESHOLDS.ammonia.warning) return "WARNING";
  return "OPTIMAL";
}

export function getH2sInterpretation(ppm: number): string {
  if (ppm < 0.5) return "Trace — minimal anaerobic decomposition.";
  if (ppm < 2) return "Low — normal; some anaerobic pockets may exist.";
  if (ppm < 5) return "Moderate — anaerobic decomposition indicated; improve aeration.";
  return "Elevated — poor aeration; turn and aerate compost promptly.";
}

export function getH2sStatus(ppm: number): ParameterStatus {
  if (ppm > THRESHOLDS.hydrogenSulfide.critical) return "CRITICAL";
  if (ppm > THRESHOLDS.hydrogenSulfide.warning) return "WARNING";
  return "OPTIMAL";
}
