import type { OperationalSnapshot } from "@/services/intelligence/intelligence-types";

export function buildForecastReasoningPrompt(input: {
  forecastType: string;
  predictedValue: number;
  snapshot: OperationalSnapshot;
}) {
  const externalLines = input.snapshot.externalData.weather
    ? [`Weather: ${input.snapshot.externalData.weather.summary}`]
    : [];
  if (input.snapshot.externalData.holidays.length > 0) {
    externalLines.push(
      `Holidays: ${input.snapshot.externalData.holidays.map((h) => h.localName).join(", ")}`,
    );
  }

  return `Analyze this food service forecast and return JSON with "factors" (array of {name, impactWeight 0-1, description}) and "explanation" (one paragraph).

Forecast type: ${input.forecastType}
Predicted value: ${input.predictedValue}
Avg waste/day: ${input.snapshot.avgWastePerDay.toFixed(1)}
Avg attendance: ${input.snapshot.avgAttendance.toFixed(0)}
Waste trend %: ${input.snapshot.wasteTrend.toFixed(1)}
Attendance trend %: ${input.snapshot.attendanceTrend.toFixed(1)}
Expiration risk items: ${input.snapshot.expirationRiskItems}
Upcoming events: ${input.snapshot.upcomingEvents.map((e) => e.name).join(", ") || "none"}
${externalLines.length > 0 ? `External signals:\n${externalLines.join("\n")}` : ""}

Provide 3-5 explainable factors. Do not change the predicted value.`;
}
