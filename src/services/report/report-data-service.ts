import {
  getAttendanceAnalytics,
  getDashboardOverview,
  getDonationAnalytics,
  getImpactAnalytics,
  getInventoryAnalytics,
  getWasteAnalytics,
} from "@/services/analytics/analytics-service";
import { listForecasts } from "@/services/forecast/forecast-service";
import { listRecommendations } from "@/services/recommendation/recommendation-service";
import type { ReportDateRange, ReportTemplateId } from "@/types/report";
import type { AnalyticsTimeRange } from "@/types/analytics";
import type { ReportContent } from "./report-types";
import { getTemplateName } from "./template-registry";

export interface CollectReportDataInput {
  organizationId: string;
  siteId: string;
  siteName: string;
  template: ReportTemplateId;
  dateRange: ReportDateRange;
}

function presetToAnalyticsRange(preset: ReportDateRange["preset"]): AnalyticsTimeRange {
  if (preset === "custom") return "month";
  return preset;
}

function metricValue(
  summary: Array<{ id: string; value: number | string }>,
  id: string,
  fallback: string | number = "N/A",
) {
  const found = summary.find((item) => item.id === id);
  return found?.value ?? fallback;
}

export async function collectReportData(input: CollectReportDataInput): Promise<ReportContent> {
  const timeRange = presetToAnalyticsRange(input.dateRange.preset);
  const filters = {
    timeRange,
    siteId: input.siteId,
    hierarchyLevel: "kitchen" as const,
    hierarchyId: input.siteId,
    category: null,
    eventId: null,
  };

  const [overview, waste, inventory, attendance, donations, impact, forecasts, recommendations] =
    await Promise.all([
      getDashboardOverview(input.organizationId),
      getWasteAnalytics(input.organizationId, filters),
      getInventoryAnalytics(input.organizationId, filters),
      getAttendanceAnalytics(input.organizationId, filters),
      getDonationAnalytics(input.organizationId, filters),
      getImpactAnalytics(input.organizationId, filters),
      listForecasts({ organizationId: input.organizationId, siteId: input.siteId }),
      listRecommendations({
        organizationId: input.organizationId,
        siteId: input.siteId,
        status: "open",
        limit: 5,
      }),
    ]);

  const title = getTemplateName(input.template);
  const subtitle = `${input.siteName} · ${input.dateRange.start} to ${input.dateRange.end}`;

  const metrics = [
    { label: "Risk Level", value: overview.riskLevel },
    { label: "Risk Score", value: String(overview.riskScore) },
    { label: "Open Recommendations", value: String(overview.openRecommendations) },
    {
      label: "Meals Saved",
      value: String(metricValue(impact.summary, "meals-saved", donations.mealsRescued)),
    },
    {
      label: "CO₂ Avoided (kg)",
      value: String(metricValue(impact.summary, "co2-avoided", 0)),
    },
    {
      label: "Money Saved",
      value: `$${metricValue(impact.summary, "money-saved", 0)}`,
    },
  ];

  const sections: ReportContent["sections"] = [];
  const topWasteDriver = waste.rootCause.drivers[0]?.name ?? "Attendance variance";

  if (
    input.template === "waste_report" ||
    input.template === "monthly_summary" ||
    input.template === "operations_review"
  ) {
    sections.push({
      title: "Waste Analysis",
      lines: [
        `Total waste: ${metricValue(waste.summary, "total-waste", 0)} kg`,
        `Top driver: ${topWasteDriver}`,
        `Root cause summary: ${waste.rootCause.summary}`,
      ],
    });
  }

  if (
    input.template === "donation_report" ||
    input.template === "community_impact" ||
    input.template === "monthly_summary"
  ) {
    sections.push({
      title: "Donation & Rescue",
      lines: [
        `Meals rescued: ${donations.mealsRescued}`,
        `Success rate: ${Math.round(donations.successRate * 100)}%`,
        `Recipient performance entries: ${donations.recipientPerformance.length}`,
      ],
    });
  }

  if (
    input.template === "sustainability_report" ||
    input.template === "executive_summary" ||
    input.template === "school_board_report"
  ) {
    sections.push({
      title: "Environmental Impact",
      lines: impact.summary.map(
        (metric) => `${metric.label}: ${metric.value}${metric.unit ? ` ${metric.unit}` : ""}`,
      ),
    });
  }

  if (input.template === "operations_review" || input.template === "monthly_summary") {
    sections.push({
      title: "Operational Health",
      lines: [
        `Pending uploads: ${overview.pendingUploads}`,
        `Inventory turnover rate: ${inventory.turnoverRate}`,
        `Storage utilization: ${inventory.storageUtilization}%`,
        `Forecast accuracy: ${Math.round(attendance.forecastAccuracy * 100)}%`,
      ],
    });
  }

  sections.push({
    title: "Forecasts & Recommendations",
    lines: [
      ...forecasts
        .slice(0, 3)
        .map(
          (forecast) =>
            `${forecast.forecastType}: ${forecast.predictedMeals} meals (${Math.round(forecast.confidence * 100)}% confidence)`,
        ),
      ...recommendations
        .slice(0, 3)
        .map((rec) => `${rec.title} — ${rec.priority} priority`),
    ],
  });

  if (sections.length === 0) {
    sections.push({
      title: "Summary",
      lines: [
        `Report generated for ${input.siteName} covering ${input.dateRange.start} to ${input.dateRange.end}.`,
      ],
    });
  }

  return { title, subtitle, sections, metrics };
}
