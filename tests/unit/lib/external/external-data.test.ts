import { describe, expect, it } from "vitest";
import {
  estimateWeatherAttendanceImpact,
  type DailyWeatherSummary,
} from "@/lib/external/open-meteo-client";
import { estimateHolidayAttendanceImpact } from "@/lib/external/nager-holidays-client";

function buildWeather(overrides: Partial<DailyWeatherSummary> = {}): DailyWeatherSummary {
  return {
    rainyDays: 0,
    totalPrecipitationMm: 0,
    maxTemperatureC: 20,
    minTemperatureC: 10,
    severeWeatherDays: 0,
    daily: [],
    ...overrides,
  };
}

describe("open-meteo-client", () => {
  it("estimates stronger negative impact for multiple rainy days", () => {
    const mild = estimateWeatherAttendanceImpact(buildWeather({ rainyDays: 1 }));
    const heavy = estimateWeatherAttendanceImpact(buildWeather({ rainyDays: 4 }));
    expect(heavy).toBeLessThan(mild);
    expect(heavy).toBe(-0.18);
  });

  it("estimates severe weather impact", () => {
    expect(estimateWeatherAttendanceImpact(buildWeather({ severeWeatherDays: 1 }))).toBe(-0.22);
  });
});

describe("nager-holidays-client", () => {
  it("estimates holiday attendance impact", () => {
    const impact = estimateHolidayAttendanceImpact([
      { date: "2026-07-04", localName: "Independence Day", name: "Independence Day", types: ["Public"] },
    ]);
    expect(impact).toBeLessThan(0);
  });
});

describe("forecast-models external integration", () => {
  it("adjusts attendance forecast when external weather impact is negative", async () => {
    const { computeForecast } = await import("@/services/forecast/forecast-models");
    const { EMPTY_EXTERNAL_DATA } = await import("@/services/intelligence/intelligence-types");

    const base = {
      organizationId: "org-1",
      siteId: "site-1",
      windowDays: 7,
      wasteMeals: [3, 4],
      attendance: [300, 310],
      expirationRiskItems: 2,
      upcomingEvents: [],
      inventoryUnits: 50,
      purchaseSpend: 1000,
      avgWastePerDay: 3,
      avgAttendance: 305,
      wasteTrend: 0,
      attendanceTrend: 0,
    };

    const withoutExternal = computeForecast("demand", { ...base, externalData: { ...EMPTY_EXTERNAL_DATA } }, 7);
    const withExternal = computeForecast("demand", {
      ...base,
      externalData: {
        ...EMPTY_EXTERNAL_DATA,
        enabled: true,
        combinedAttendanceImpact: -0.18,
        sources: ["Open-Meteo"],
        weather: {
          rainyDays: 3,
          totalPrecipitationMm: 12,
          severeWeatherDays: 0,
          attendanceImpact: -0.18,
          summary: "Rain expected",
        },
      },
    }, 7);

    expect(withExternal.attendanceForecast).toBeLessThan(withoutExternal.attendanceForecast);
    expect(withExternal.factors.some((f) => f.name === "Weather Forecast")).toBe(true);
  });
});
