import type { ForecastDetail, ForecastSummary } from "@/types/forecast";
import type { RecommendationDetail } from "@/types/recommendation";
import type { ForecastSummaryKpis } from "@/types/predictions";
import type {
  Simulation,
  SimulationComparison,
  SimulationInput,
  SimulationResult,
} from "@/types/simulation";
import { getMockForecasts } from "@/lib/mocks/dashboard-fixtures";
import { getOrgContext } from "@/lib/demo/org-context";
import { patchSiteFields, patchSiteFieldsList } from "@/lib/demo/apply-org-context";

const DEFAULT_ORG = "org_demo_123";

const FORECAST_FACTORS = [
  {
    name: "Rain Forecast",
    impactWeight: 0.34,
    description: "Expected attendance reduction due to rain on Thursday",
  },
  {
    name: "Attendance Drop",
    impactWeight: 0.28,
    description: "Historical pattern after exam days",
  },
  {
    name: "Milk Expiration",
    impactWeight: 0.22,
    description: "Current inventory expires within 48 hours",
  },
  {
    name: "Menu Change",
    impactWeight: 0.16,
    description: "New vegetarian option may shift demand",
  },
];

export function getMockForecastSummaryKpis(orgId: string = DEFAULT_ORG): ForecastSummaryKpis {
  const ctx = getOrgContext(orgId);
  return {
    predictedSurplusMeals: 142,
    predictedWasteMeals: 47,
    expirationRiskItems: 12,
    attendanceForecast: 318,
    purchasingForecast: 2840,
    confidence: 0.87,
    forecastWindowDays: 7,
    siteName: ctx.primarySiteName,
  };
}

export function getMockForecastDetail(id: string, orgId: string = DEFAULT_ORG): ForecastDetail | null {
  const summary = getMockForecasts(orgId).find((f) => f.id === id);
  if (!summary) return null;

  return {
    ...summary,
    factors: FORECAST_FACTORS,
    predictedWasteMeals: 47,
    expirationRiskItems: 12,
    attendanceForecast: 318,
    purchasingForecast: 2840,
    linkedRecommendationIds: ["rec_001", "rec_002", "rec_003"],
  };
}

export function getMockForecastDetails(orgId: string = DEFAULT_ORG): ForecastDetail[] {
  return getMockForecasts(orgId)
    .map((f) => getMockForecastDetail(f.id, orgId))
    .filter((f): f is ForecastDetail => f !== null);
}

export function getMockRecommendationDetail(
  id: string,
  orgId: string = DEFAULT_ORG,
): RecommendationDetail | null {
  const details: Record<string, RecommendationDetail> = {
    rec_001: {
      id: "rec_001",
      title: "Reduce milk order by 15%",
      description:
        "Forecast shows surplus milk due to lower attendance and upcoming rain.",
      impact: "Save ~42 meals worth of waste",
      confidence: 0.91,
      priority: "high",
      status: "open",
      siteId: "site_001",
      siteName: "Main Kitchen",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      problem:
        "Milk inventory exceeds projected demand for the next 7 days due to attendance decline.",
      evidence: [
        "Attendance forecast down 12% vs last week",
        "Rain expected Thursday — historically reduces lunch participation by 18%",
        "Current milk stock: 380 units vs projected need: 322 units",
      ],
      reasoning:
        "Combining weather forecast, attendance patterns, and current inventory levels indicates a 15% order reduction would align supply with demand while maintaining buffer stock.",
      linkedForecastId: "fcst_001",
      expectedImpact: "Prevent 42 meals of waste · Save ~$214",
      assigneeId: null,
      assigneeName: null,
      dueDate: null,
    },
    rec_002: {
      id: "rec_002",
      title: "Repurpose bread into croutons",
      description: "Day-old bread can be used before expiration on Friday.",
      impact: "Divert 18 kg of surplus",
      confidence: 0.78,
      priority: "medium",
      status: "open",
      siteId: "site_001",
      siteName: "Main Kitchen",
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      problem: "Day-old bread inventory approaching expiration.",
      evidence: [
        "24 loaves expire Friday",
        "Crouton production uses day-old bread per standard protocol",
      ],
      reasoning:
        "Repurposing before expiration converts potential waste into usable inventory for salads and soups.",
      linkedForecastId: "fcst_001",
      expectedImpact: "Divert 18 kg · Rescue 28 meals",
      assigneeId: null,
      assigneeName: null,
      dueDate: null,
    },
    rec_003: {
      id: "rec_003",
      title: "Schedule donation pickup for produce",
      description: "Apples and carrots expiring within 48 hours.",
      impact: "Rescue 35 meals",
      confidence: 0.85,
      priority: "high",
      status: "open",
      siteId: "site_001",
      siteName: "Main Kitchen",
      createdAt: new Date(Date.now() - 10800000).toISOString(),
      problem: "Fresh produce surplus with short shelf life.",
      evidence: [
        "15 kg apples expiring in 48 hours",
        "8 kg carrots expiring in 36 hours",
        "Local food bank has pickup capacity Thursday",
      ],
      reasoning:
        "Donation pickup before expiration maximizes community impact while reducing waste.",
      linkedForecastId: "fcst_001",
      expectedImpact: "Rescue 35 meals · 23 kg diverted",
      assigneeId: null,
      assigneeName: null,
      dueDate: null,
    },
  };

  const detail = details[id];
  if (!detail) return null;
  return patchSiteFields(orgId, detail);
}

let mockSimulations: Simulation[] = [
  {
    id: "sim_001",
    name: "Reduce Milk Orders",
    orgId: "org_demo_123",
    changes: {
      attendanceChange: -5,
      productionChange: 0,
      inventoryChange: -15,
      ordersChange: -15,
      weatherImpact: -10,
      eventImpact: 0,
      donationsChange: 0,
    },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "sim_002",
    name: "Rain Day Prep",
    orgId: "org_demo_123",
    changes: {
      attendanceChange: -15,
      productionChange: -10,
      inventoryChange: 0,
      ordersChange: -8,
      weatherImpact: -20,
      eventImpact: 0,
      donationsChange: 5,
    },
    createdAt: new Date(Date.now() - 43200000).toISOString(),
  },
];

const DEFAULT_SIMULATION_INPUT: SimulationInput = {
  attendanceChange: 0,
  productionChange: 0,
  inventoryChange: 0,
  ordersChange: 0,
  weatherImpact: 0,
  eventImpact: 0,
  donationsChange: 0,
};

function calculateMockResult(changes: SimulationInput): SimulationResult {
  const totalChange =
    changes.attendanceChange * 0.3 +
    changes.productionChange * 0.25 +
    changes.inventoryChange * 0.15 +
    changes.ordersChange * 0.2 +
    changes.weatherImpact * 0.15 +
    changes.eventImpact * 0.1 +
    changes.donationsChange * -0.1;

  const wasteReduction = Math.max(0, Math.round(totalChange * 0.8));
  const wasteChange = -wasteReduction;
  const costSavings = Math.round(wasteReduction * 8.2);
  const shortageRisk = Math.max(0, Math.min(100, 20 - totalChange * 0.5));
  const environmentalImpact = Math.round(wasteReduction * 2.1);
  const confidence = Math.min(0.95, 0.7 + Math.abs(totalChange) * 0.005);
  const predictedSurplus = Math.max(0, 142 - wasteReduction);

  return {
    wasteReduction,
    wasteChange,
    costSavings,
    shortageRisk,
    environmentalImpact,
    confidence,
    predictedSurplus,
  };
}

export function getMockSimulations(orgId: string): Simulation[] {
  return mockSimulations.filter((s) => s.orgId === orgId || orgId.startsWith("org_demo"));
}

export function createMockSimulation(
  orgId: string,
  name: string,
  changes: Partial<SimulationInput>,
): Simulation {
  const simulation: Simulation = {
    id: `sim_${Date.now()}`,
    name,
    orgId,
    changes: { ...DEFAULT_SIMULATION_INPUT, ...changes },
    createdAt: new Date().toISOString(),
  };
  mockSimulations = [simulation, ...mockSimulations];
  return simulation;
}

export function runMockSimulation(id: string): SimulationResult | null {
  const simulation = mockSimulations.find((s) => s.id === id);
  if (!simulation) return null;
  return calculateMockResult(simulation.changes);
}

export function runMockSimulationWithChanges(
  changes: SimulationInput,
): SimulationResult {
  return calculateMockResult(changes);
}

export function compareMockSimulations(
  ids: string[],
): SimulationComparison | null {
  const results = ids
    .map((id) => {
      const sim = mockSimulations.find((s) => s.id === id);
      const result = sim ? calculateMockResult(sim.changes) : null;
      return sim && result ? { id: sim.id, name: sim.name, result } : null;
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  if (results.length < 2) return null;

  const winner = results.reduce((best, current) =>
    current.result.wasteReduction > best.result.wasteReduction ? current : best,
  );

  return {
    simulations: results,
    winnerId: winner.id,
  };
}

export function filterMockForecasts(
  forecasts: ForecastSummary[],
  filters: {
    forecastType?: string | null;
    siteId?: string | null;
  },
): ForecastSummary[] {
  return forecasts.filter((f) => {
    if (filters.forecastType && filters.forecastType !== "all") {
      if (f.forecastType !== filters.forecastType) return false;
    }
    if (filters.siteId && filters.siteId !== "all") {
      if (f.siteId !== filters.siteId) return false;
    }
    return true;
  });
}
