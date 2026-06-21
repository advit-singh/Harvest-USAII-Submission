import type {
  AnalyticsFilters,
  AnalyticsImpact,
  AttendanceAnalytics,
  DonationAnalytics,
  HierarchyNode,
  InventoryAnalytics,
  WasteAnalytics,
} from "@/types/analytics";

const DEMO_SITE = "Lincoln Elementary Cafeteria";
const DEMO_SITE_ID = "site_001";

const TIME_MULTIPLIERS: Record<AnalyticsFilters["timeRange"], number> = {
  week: 1,
  month: 4,
  quarter: 12,
  year: 48,
};

function isEmptyOrg(orgId: string): boolean {
  return orgId.startsWith("org_empty") || orgId === "org_new";
}

function orgScale(orgId: string): number {
  if (orgId === "org_demo_456") return 1.4;
  if (orgId === "org_demo_789") return 2.1;
  return 1;
}

function orgSiteName(orgId: string): string {
  if (orgId === "org_demo_456") return "Riverside Main Kitchen";
  if (orgId === "org_demo_789") return "Metro University Dining Hall";
  return DEMO_SITE;
}

function scale(value: number, timeRange: AnalyticsFilters["timeRange"]): number {
  return Math.round(value * TIME_MULTIPLIERS[timeRange]);
}

export function getMockHierarchyNodes(): HierarchyNode[] {
  return [
    { id: "org_001", name: "Lincoln School District", level: "organization", parentId: null },
    { id: "region_001", name: "North Region", level: "region", parentId: "org_001" },
    { id: "campus_001", name: "Lincoln Elementary", level: "campus", parentId: "region_001" },
    { id: "building_001", name: "Main Building", level: "building", parentId: "campus_001" },
    { id: "kitchen_001", name: DEMO_SITE, level: "kitchen", parentId: "building_001" },
    { id: "storage_001", name: "Cold Storage A", level: "storage", parentId: "kitchen_001" },
  ];
}

export function getMockWasteAnalytics(
  orgId: string,
  filters: AnalyticsFilters,
): WasteAnalytics {
  if (isEmptyOrg(orgId)) {
    return {
      timeSeries: [],
      byCategory: [],
      byItem: [],
      bySite: [],
      byEvent: [],
      rootCause: { drivers: [], confidence: 0, summary: "No data available." },
      summary: [],
    };
  }

  const m = TIME_MULTIPLIERS[filters.timeRange];
  const scaleFactor = orgScale(orgId);
  const siteName = orgSiteName(orgId);

  return {
    timeSeries: [
      { date: "Week 1", value: Math.round((scale(42, filters.timeRange) / m) * scaleFactor) },
      { date: "Week 2", value: Math.round((scale(38, filters.timeRange) / m) * scaleFactor) },
      { date: "Week 3", value: Math.round((scale(51, filters.timeRange) / m) * scaleFactor) },
      { date: "Week 4", value: Math.round((scale(47, filters.timeRange) / m) * scaleFactor) },
    ],
    byCategory: [
      { id: "cat_dairy", name: "Dairy", value: Math.round(scale(34, filters.timeRange) * scaleFactor), unit: "kg", percent: 38 },
      { id: "cat_produce", name: "Produce", value: Math.round(scale(22, filters.timeRange) * scaleFactor), unit: "kg", percent: 25 },
      { id: "cat_grains", name: "Grains", value: Math.round(scale(18, filters.timeRange) * scaleFactor), unit: "kg", percent: 20 },
      { id: "cat_protein", name: "Protein", value: Math.round(scale(15, filters.timeRange) * scaleFactor), unit: "kg", percent: 17 },
    ],
    byItem: [
      { id: "item_milk", name: "Whole milk", value: Math.round(scale(24, filters.timeRange) * scaleFactor), unit: "kg", percent: 28 },
      { id: "item_bread", name: "Whole wheat bread", value: Math.round(scale(16, filters.timeRange) * scaleFactor), unit: "kg", percent: 19 },
      { id: "item_apples", name: "Fresh apples", value: Math.round(scale(12, filters.timeRange) * scaleFactor), unit: "kg", percent: 14 },
      { id: "item_chicken", name: "Grilled chicken", value: Math.round(scale(10, filters.timeRange) * scaleFactor), unit: "kg", percent: 12 },
    ],
    bySite: [
      { id: DEMO_SITE_ID, name: siteName, value: Math.round(scale(89, filters.timeRange) * scaleFactor), unit: "kg", percent: 72 },
      { id: "site_002", name: orgId === "org_demo_789" ? "North Campus Cafeteria" : "Secondary Site", value: Math.round(scale(34, filters.timeRange) * scaleFactor), unit: "kg", percent: 28 },
    ],
    byEvent: [
      { id: "evt_rain", name: "Rain day lunch", value: scale(28, filters.timeRange), unit: "kg", percent: 32 },
      { id: "evt_field", name: "Field trip day", value: scale(21, filters.timeRange), unit: "kg", percent: 24 },
      { id: "evt_holiday", name: "Holiday week", value: scale(18, filters.timeRange), unit: "kg", percent: 20 },
    ],
    rootCause: {
      drivers: [
        { name: "Weather", percent: 38, description: "Rain reduced outdoor lunch attendance" },
        { name: "Attendance Variance", percent: 27, description: "Lower than forecast meal counts" },
        { name: "Menu Preference", percent: 21, description: "Students skipped milk option" },
        { name: "Inventory Expiration", percent: 14, description: "Milk cartons nearing expiry" },
      ],
      confidence: 0.86,
      summary: "Waste increased 18% vs prior period, primarily driven by weather-related attendance drops and milk over-ordering.",
    },
    summary: [
      { id: "total_waste", label: "Total waste", value: scale(89, filters.timeRange), unit: "kg", trend: "up", trendPercent: 18 },
      { id: "waste_rate", label: "Waste rate", value: "12.4%", trend: "up", trendPercent: 2.1 },
      { id: "preventable", label: "Preventable waste", value: scale(62, filters.timeRange), unit: "kg", trend: "up", trendPercent: 15 },
      { id: "cost_impact", label: "Cost impact", value: `$${scale(184, filters.timeRange)}`, trend: "up", trendPercent: 12 },
    ],
  };
}

export function getMockInventoryAnalytics(
  orgId: string,
  filters: AnalyticsFilters,
): InventoryAnalytics {
  if (isEmptyOrg(orgId)) {
    return {
      trends: [],
      turnoverRate: 0,
      expirationRisk: [],
      categoryUtilization: [],
      storageUtilization: 0,
      summary: [],
    };
  }

  return {
    trends: [
      { date: "Week 1", value: 380 },
      { date: "Week 2", value: 395 },
      { date: "Week 3", value: 412 },
      { date: "Week 4", value: 388 },
    ],
    turnoverRate: 4.2,
    expirationRisk: [
      { id: "risk_milk", name: "Dairy", value: 12, unit: "items", percent: 42 },
      { id: "risk_bread", name: "Bakery", value: 8, unit: "items", percent: 28 },
      { id: "risk_produce", name: "Produce", value: 5, unit: "items", percent: 18 },
      { id: "risk_protein", name: "Protein", value: 3, unit: "items", percent: 12 },
    ],
    categoryUtilization: [
      { id: "util_dairy", name: "Dairy", value: 82, unit: "%" },
      { id: "util_produce", name: "Produce", value: 71, unit: "%" },
      { id: "util_grains", name: "Grains", value: 68, unit: "%" },
      { id: "util_protein", name: "Protein", value: 74, unit: "%" },
    ],
    storageUtilization: 68,
    summary: [
      { id: "total_units", label: "Inventory units", value: scale(388, filters.timeRange), trend: "flat", trendPercent: 1 },
      { id: "turnover", label: "Turnover rate", value: "4.2x", trend: "up", trendPercent: 5 },
      { id: "expiring", label: "Expiring soon", value: 12, unit: "items", trend: "up", trendPercent: 20 },
      { id: "utilization", label: "Avg utilization", value: "74%", trend: "down", trendPercent: 3 },
    ],
  };
}

export function getMockAttendanceAnalytics(
  orgId: string,
  filters: AnalyticsFilters,
): AttendanceAnalytics {
  if (isEmptyOrg(orgId)) {
    return {
      trends: [],
      forecastAccuracy: 0,
      seasonality: [],
      eventImpact: [],
      summary: [],
    };
  }

  return {
    trends: [
      { date: "Mon", value: 412 },
      { date: "Tue", value: 398 },
      { date: "Wed", value: 385 },
      { date: "Thu", value: 401 },
      { date: "Fri", value: 378 },
    ],
    forecastAccuracy: 0.91,
    seasonality: [
      { date: "Fall", value: 405 },
      { date: "Winter", value: 392 },
      { date: "Spring", value: 418 },
      { date: "Summer", value: 180 },
    ],
    eventImpact: [
      { id: "evt_rain", name: "Rain days", value: -12, unit: "%", percent: 35 },
      { id: "evt_field", name: "Field trips", value: -8, unit: "%", percent: 25 },
      { id: "evt_assembly", name: "School assemblies", value: -5, unit: "%", percent: 18 },
      { id: "evt_holiday", name: "Holiday weeks", value: -15, unit: "%", percent: 22 },
    ],
    summary: [
      { id: "avg_attendance", label: "Avg daily attendance", value: scale(395, filters.timeRange), trend: "down", trendPercent: 6 },
      { id: "forecast_accuracy", label: "Forecast accuracy", value: "91%", trend: "up", trendPercent: 2 },
      { id: "variance", label: "Attendance variance", value: "±8.2%", trend: "up", trendPercent: 3 },
      { id: "peak_day", label: "Peak day", value: "Tuesday", trend: "flat" },
    ],
  };
}

export function getMockDonationAnalytics(
  orgId: string,
  filters: AnalyticsFilters,
): DonationAnalytics {
  if (isEmptyOrg(orgId)) {
    return {
      history: [],
      recipientPerformance: [],
      mealsRescued: 0,
      successRate: 0,
      summary: [],
    };
  }

  return {
    history: [
      { date: "Week 1", value: scale(28, filters.timeRange) / TIME_MULTIPLIERS[filters.timeRange] },
      { date: "Week 2", value: scale(35, filters.timeRange) / TIME_MULTIPLIERS[filters.timeRange] },
      { date: "Week 3", value: scale(42, filters.timeRange) / TIME_MULTIPLIERS[filters.timeRange] },
      { date: "Week 4", value: scale(38, filters.timeRange) / TIME_MULTIPLIERS[filters.timeRange] },
    ],
    recipientPerformance: [
      { id: "rec_001", name: "Community Kitchen", value: scale(48, filters.timeRange), unit: "meals", percent: 42 },
      { id: "rec_002", name: "Northside Food Bank", value: scale(32, filters.timeRange), unit: "meals", percent: 28 },
      { id: "rec_003", name: "Shelter Hope", value: scale(24, filters.timeRange), unit: "meals", percent: 21 },
      { id: "rec_004", name: "Senior Center", value: scale(10, filters.timeRange), unit: "meals", percent: 9 },
    ],
    mealsRescued: scale(114, filters.timeRange),
    successRate: 0.94,
    summary: [
      { id: "meals_rescued", label: "Meals rescued", value: scale(114, filters.timeRange), trend: "up", trendPercent: 22 },
      { id: "success_rate", label: "Success rate", value: "94%", trend: "up", trendPercent: 3 },
      { id: "recipients", label: "Active recipients", value: 4, trend: "flat" },
      { id: "avg_pickup", label: "Avg pickup time", value: "4.2 hrs", trend: "down", trendPercent: 8 },
    ],
  };
}

export function getMockAnalyticsImpact(
  orgId: string,
  filters: AnalyticsFilters,
): AnalyticsImpact {
  if (isEmptyOrg(orgId)) {
    return {
      environmental: { label: "Environmental", metrics: [], timeSeries: [] },
      financial: { label: "Financial", metrics: [], timeSeries: [] },
      community: { label: "Community", metrics: [], timeSeries: [] },
      summary: [],
    };
  }

  const m = TIME_MULTIPLIERS[filters.timeRange];

  return {
    environmental: {
      label: "Environmental",
      metrics: [
        { id: "co2", label: "CO₂ avoided", value: scale(91, filters.timeRange), unit: "kg" },
        { id: "water", label: "Water saved", value: scale(420, filters.timeRange), unit: "gal" },
        { id: "landfill", label: "Landfill diverted", value: scale(91, filters.timeRange), unit: "kg" },
      ],
      timeSeries: [
        { date: "Week 1", value: scale(18, filters.timeRange) / m },
        { date: "Week 2", value: scale(22, filters.timeRange) / m },
        { date: "Week 3", value: scale(28, filters.timeRange) / m },
        { date: "Week 4", value: scale(23, filters.timeRange) / m },
      ],
    },
    financial: {
      label: "Financial",
      metrics: [
        { id: "saved", label: "Money saved", value: `$${scale(184, filters.timeRange)}` },
        { id: "waste_cost", label: "Waste cost avoided", value: `$${scale(142, filters.timeRange)}` },
        { id: "efficiency", label: "Efficiency gain", value: "8.4%" },
      ],
      timeSeries: [
        { date: "Week 1", value: scale(38, filters.timeRange) / m },
        { date: "Week 2", value: scale(42, filters.timeRange) / m },
        { date: "Week 3", value: scale(52, filters.timeRange) / m },
        { date: "Week 4", value: scale(52, filters.timeRange) / m },
      ],
    },
    community: {
      label: "Community",
      metrics: [
        { id: "meals", label: "Meals provided", value: scale(114, filters.timeRange) },
        { id: "people", label: "People impacted", value: scale(285, filters.timeRange) },
        { id: "orgs", label: "Partner organizations", value: 4 },
      ],
      timeSeries: [
        { date: "Week 1", value: scale(28, filters.timeRange) / m },
        { date: "Week 2", value: scale(35, filters.timeRange) / m },
        { date: "Week 3", value: scale(42, filters.timeRange) / m },
        { date: "Week 4", value: scale(38, filters.timeRange) / m },
      ],
    },
    summary: [
      { id: "total_impact", label: "Total impact score", value: 82, trend: "up", trendPercent: 15 },
      { id: "meals_saved", label: "Meals saved", value: scale(42, filters.timeRange), trend: "up", trendPercent: 18 },
      { id: "co2", label: "CO₂ avoided", value: `${scale(91, filters.timeRange)} kg`, trend: "up", trendPercent: 12 },
      { id: "money", label: "Money saved", value: `$${scale(184, filters.timeRange)}`, trend: "up", trendPercent: 10 },
    ],
  };
}
