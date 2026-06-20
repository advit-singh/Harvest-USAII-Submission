import type { DashboardOverview } from "@/types/dashboard";
import type { DonationOpportunity } from "@/types/donation";
import { getMockDonationOpportunitiesFromRescue } from "@/lib/mocks/rescue-fixtures";
import type { ForecastSummary } from "@/types/forecast";
import type { ImpactMetrics } from "@/types/impact";
import type { InventoryHealth } from "@/types/inventory";
import type { HarvestNotification } from "@/types/notification";
import type { Recommendation } from "@/types/recommendation";

/** School cafeteria demo story — PRD §30 */

const DEMO_SITE = "Lincoln Elementary Cafeteria";

export function getMockDashboardOverview(orgId: string): DashboardOverview {
  if (orgId.startsWith("org_empty") || orgId === "org_new") {
    return {
      hasOperationalData: false,
      riskLevel: "low",
      riskScore: 0,
      forecastWindowDays: 7,
      primaryDrivers: [],
      openRecommendations: 0,
      pendingUploads: 0,
    };
  }

  return {
    hasOperationalData: true,
    riskLevel: "high",
    riskScore: 82,
    forecastWindowDays: 7,
    primaryDrivers: ["Rain Forecast", "Attendance Drop", "Milk Expiration"],
    openRecommendations: 3,
    pendingUploads: 1,
  };
}

export function getMockForecasts(): ForecastSummary[] {
  return [
    {
      id: "fcst_001",
      forecastType: "surplus",
      siteId: "site_001",
      siteName: DEMO_SITE,
      predictedMeals: 142,
      predictedInventoryUnits: 380,
      confidence: 0.87,
      forecastWindowDays: 7,
      generatedAt: new Date().toISOString(),
      trend: "up",
      historyPoints: [
        { date: "Mon", value: 98 },
        { date: "Tue", value: 105 },
        { date: "Wed", value: 112 },
        { date: "Thu", value: 118 },
        { date: "Fri", value: 128 },
        { date: "Sat", value: 135 },
        { date: "Sun", value: 142 },
      ],
    },
  ];
}

let mockRecommendations: Recommendation[] = [
  {
    id: "rec_001",
    title: "Reduce milk order by 15%",
    description:
      "Forecast shows surplus milk due to lower attendance and upcoming rain.",
    impact: "Save ~42 meals worth of waste",
    confidence: 0.91,
    priority: "high",
    status: "open",
    siteId: "site_001",
    siteName: DEMO_SITE,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "rec_002",
    title: "Repurpose bread into croutons",
    description: "Day-old bread can be used before expiration on Friday.",
    impact: "Divert 18 kg of surplus",
    confidence: 0.78,
    priority: "medium",
    status: "open",
    siteId: "site_001",
    siteName: DEMO_SITE,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "rec_003",
    title: "Schedule donation pickup for produce",
    description: "Apples and carrots expiring within 48 hours.",
    impact: "Rescue 35 meals",
    confidence: 0.85,
    priority: "high",
    status: "open",
    siteId: "site_001",
    siteName: DEMO_SITE,
    createdAt: new Date(Date.now() - 10800000).toISOString(),
  },
];

export function getMockRecommendations(): Recommendation[] {
  return mockRecommendations.filter((r) => r.status === "open");
}

export function updateMockRecommendationAction(
  id: string,
  action: "accepted" | "rejected" | "snoozed" | "completed",
): Recommendation | null {
  const index = mockRecommendations.findIndex((r) => r.id === id);
  if (index === -1) return null;

  const statusMap = {
    accepted: "accepted" as const,
    rejected: "rejected" as const,
    snoozed: "snoozed" as const,
    completed: "completed" as const,
  };

  mockRecommendations[index] = {
    ...mockRecommendations[index],
    status: statusMap[action],
  };

  return mockRecommendations[index];
}

export function getMockImpact(timeRange: ImpactMetrics["timeRange"]): ImpactMetrics {
  const labels: Record<ImpactMetrics["timeRange"], string> = {
    week: "This week",
    month: "This month",
    quarter: "This quarter",
    year: "This year",
  };

  const multipliers: Record<ImpactMetrics["timeRange"], number> = {
    week: 1,
    month: 4,
    quarter: 12,
    year: 48,
  };

  const m = multipliers[timeRange];

  return {
    timeRange,
    mealsSaved: 42 * m,
    foodDivertedKg: 91 * m,
    moneySaved: 184 * m,
    co2AvoidedKg: 91 * m,
    periodLabel: labels[timeRange],
  };
}

export function getMockInventoryHealth(): InventoryHealth {
  return {
    status: "warning",
    expiringItems: 12,
    utilizationPercent: 74,
    storageCapacityPercent: 68,
    topAlerts: [
      "Milk cartons expiring in 2 days",
      "Bread inventory above forecast demand",
      "Cold storage at 68% capacity",
    ],
  };
}

export function getMockDonationOpportunities(): DonationOpportunity[] {
  return getMockDonationOpportunitiesFromRescue();
}

export function getMockNotifications(): HarvestNotification[] {
  return [
    {
      id: "notif_001",
      type: "upload.completed",
      severity: "informational",
      title: "Receipt upload processed",
      message: "Lincoln Elementary lunch receipt extracted successfully.",
      href: "/uploads?id=upl_001&tab=queue",
      isRead: false,
      createdAt: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: "notif_002",
      type: "forecast.generated",
      severity: "warning",
      title: "Surplus forecast updated",
      message: "7-day surplus forecast generated with 87% confidence.",
      href: "/predictions",
      isRead: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "notif_003",
      type: "recommendation.created",
      severity: "informational",
      title: "New recommendation",
      message: "Reduce milk order by 15% — high priority.",
      href: "/predictions?tab=recommendations",
      isRead: false,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: "notif_004",
      type: "donation.completed",
      severity: "informational",
      title: "Donation matched",
      message: "Bread loaves matched with Community Kitchen.",
      href: "/rescue",
      isRead: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "notif_005",
      type: "validation.warning",
      severity: "critical",
      title: "Attendance spike detected",
      message: "Upload validation flagged an unusual attendance increase.",
      href: "/uploads?tab=validation",
      isRead: false,
      createdAt: new Date(Date.now() - 900000).toISOString(),
    },
    {
      id: "notif_006",
      type: "assignment.received",
      severity: "warning",
      title: "Recommendation assigned to you",
      message: "Review milk order reduction recommendation.",
      href: "/predictions?tab=recommendations",
      isRead: false,
      createdAt: new Date(Date.now() - 5400000).toISOString(),
    },
  ];
}

export function resetMockRecommendations(): void {
  mockRecommendations = mockRecommendations.map((r) =>
    r.status !== "open" ? { ...r, status: "open" as const } : r,
  );
}
