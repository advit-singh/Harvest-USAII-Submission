import type { ForecastType } from "@/types/forecast";
import type {
  ForecastComputation,
  OperationalSnapshot,
} from "@/services/intelligence/intelligence-types";

const MEAL_COST_ESTIMATE = 4.5;

export function computeForecast(
  forecastType: ForecastType,
  snapshot: OperationalSnapshot,
  horizonDays: number,
): ForecastComputation {
  const demandProxy = snapshot.avgAttendance || 300;
  const supplyProxy = snapshot.inventoryUnits / 10 + snapshot.avgWastePerDay;
  const surplusBase = Math.max(0, supplyProxy - demandProxy * 0.15);
  const wasteBase = Math.max(snapshot.avgWastePerDay * horizonDays, 0);
  const attendanceForecast = Math.round(
    demandProxy * (1 + snapshot.attendanceTrend / 100) * horizonDays,
  );
  const purchasingForecast = Math.round(
    (snapshot.purchaseSpend / Math.max(snapshot.windowDays, 1)) * horizonDays ||
      demandProxy * MEAL_COST_ESTIMATE * horizonDays,
  );

  let predictedValue = surplusBase;
  if (forecastType === "waste") {
    predictedValue = wasteBase;
  } else if (forecastType === "demand") {
    predictedValue = attendanceForecast;
  } else {
    predictedValue = surplusBase + snapshot.expirationRiskItems * 2;
  }

  const eventModifier = snapshot.upcomingEvents.length > 0 ? 1.08 : 1;
  predictedValue = Math.round(predictedValue * eventModifier);

  const dataPoints =
    snapshot.wasteMeals.length + snapshot.attendance.length + snapshot.inventoryUnits > 0 ? 3 : 0;
  const confidence = Math.min(
    0.95,
    Math.max(0.45, 0.55 + dataPoints * 0.08 - Math.abs(snapshot.wasteTrend) / 200),
  );

  const factors = buildRuleFactors(snapshot);
  const historyPoints = buildHistoryPoints(snapshot, forecastType);
  const trend = snapshot.wasteTrend > 5 ? "up" : snapshot.wasteTrend < -5 ? "down" : "stable";

  return {
    forecastType,
    predictedValue,
    confidence,
    explanation: buildExplanation(forecastType, snapshot, predictedValue),
    factors,
    predictedSurplusMeals: Math.round(surplusBase * eventModifier),
    predictedWasteMeals:
      forecastType === "waste" ? predictedValue : Math.round(wasteBase * eventModifier),
    expirationRiskItems: snapshot.expirationRiskItems,
    attendanceForecast,
    purchasingForecast,
    historyPoints,
    trend,
  };
}

function buildRuleFactors(snapshot: OperationalSnapshot) {
  const factors: ForecastComputation["factors"] = [];

  if (snapshot.attendanceTrend !== 0) {
    factors.push({
      name: "Attendance Trend",
      impactWeight: Math.min(0.35, Math.abs(snapshot.attendanceTrend) / 100),
      description: `Attendance ${snapshot.attendanceTrend > 0 ? "increased" : "decreased"} ${Math.abs(snapshot.attendanceTrend).toFixed(0)}% vs prior period`,
    });
  }

  if (snapshot.expirationRiskItems > 0) {
    factors.push({
      name: "Expiration Risk",
      impactWeight: Math.min(0.4, snapshot.expirationRiskItems / 20),
      description: `${snapshot.expirationRiskItems} inventory lots expiring within the forecast window`,
    });
  }

  if (snapshot.upcomingEvents.length > 0) {
    factors.push({
      name: "Upcoming Events",
      impactWeight: 0.2,
      description: `${snapshot.upcomingEvents.length} scheduled event(s) may shift demand`,
    });
  }

  if (snapshot.wasteTrend !== 0) {
    factors.push({
      name: "Waste Trend",
      impactWeight: Math.min(0.3, Math.abs(snapshot.wasteTrend) / 100),
      description: `Waste volumes trending ${snapshot.wasteTrend > 0 ? "up" : "down"} ${Math.abs(snapshot.wasteTrend).toFixed(0)}%`,
    });
  }

  if (factors.length === 0) {
    factors.push({
      name: "Limited History",
      impactWeight: 0.15,
      description: "Sparse operational data; forecast uses conservative defaults",
    });
  }

  return factors;
}

function buildHistoryPoints(snapshot: OperationalSnapshot, forecastType: ForecastType) {
  const source =
    forecastType === "demand" ? snapshot.attendance : snapshot.wasteMeals;
  if (source.length === 0) {
    const today = new Date();
    return Array.from({ length: 5 }, (_, index) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (4 - index));
      return { date: date.toISOString().slice(0, 10), value: 0 };
    });
  }

  return source.slice(0, 7).map((value, index) => {
    const date = new Date();
    date.setDate(date.getDate() - index);
    return { date: date.toISOString().slice(0, 10), value };
  });
}

function buildExplanation(
  forecastType: ForecastType,
  snapshot: OperationalSnapshot,
  predictedValue: number,
): string {
  const typeLabel =
    forecastType === "waste" ? "waste" : forecastType === "demand" ? "demand" : "surplus";
  return `Projected ${typeLabel} of ${predictedValue} over the window based on ${snapshot.wasteMeals.length} waste records, ${snapshot.attendance.length} attendance records, and ${snapshot.expirationRiskItems} items at expiration risk.`;
}

export { MEAL_COST_ESTIMATE };
