"use client";

import { getMockWasteAnalytics } from "@/lib/mocks/analytics-fixtures";
import { getMockForecasts, getMockRecommendations } from "@/lib/mocks/dashboard-fixtures";
import { DEFAULT_ANALYTICS_FILTERS } from "@/features/analytics/schemas/analytics-filters.schema";
import { toAnalyticsFilters } from "@/features/analytics/config/analytics-tabs";

export interface OrgContextCitation {
  id: string;
  sourceType: string;
  title: string;
  excerpt: string;
  href: string;
}

export function buildClientOrgContext(orgId: string): {
  context: string;
  citations: OrgContextCitation[];
} {
  const waste = getMockWasteAnalytics(orgId, toAnalyticsFilters(DEFAULT_ANALYTICS_FILTERS));

  const forecasts = getMockForecasts();
  const recommendations = getMockRecommendations();

  const citations: OrgContextCitation[] = [];

  if (waste.summary[0]) {
    citations.push({
      id: "cite_waste_summary",
      sourceType: "waste",
      title: "Waste summary",
      excerpt: `${waste.summary[0].label}: ${waste.summary[0].value}${waste.summary[0].unit ? ` ${waste.summary[0].unit}` : ""}`,
      href: "/analytics?tab=waste",
    });
  }

  if (waste.rootCause.summary) {
    citations.push({
      id: "cite_root_cause",
      sourceType: "waste",
      title: "Root cause analysis",
      excerpt: waste.rootCause.summary,
      href: "/analytics?tab=waste",
    });
  }

  forecasts.slice(0, 2).forEach((fc, index) => {
    citations.push({
      id: `cite_fc_${index}`,
      sourceType: "forecast",
      title: `${fc.forecastType} forecast — ${fc.siteName}`,
      excerpt: `Predicted ${fc.predictedMeals} meals with ${Math.round(fc.confidence * 100)}% confidence`,
      href: "/predictions?tab=explorer",
    });
  });

  recommendations.slice(0, 2).forEach((rec, index) => {
    citations.push({
      id: `cite_rec_${index}`,
      sourceType: "recommendation",
      title: rec.title,
      excerpt: rec.description,
      href: "/predictions?tab=recommendations",
    });
  });

  const context = [
    "WASTE SUMMARY:",
    waste.summary.map((m) => `- ${m.label}: ${m.value}${m.unit ? ` ${m.unit}` : ""}`).join("\n"),
    "",
    "ROOT CAUSE:",
    waste.rootCause.summary,
    waste.rootCause.drivers.map((d) => `- ${d.name}: ${d.percent}% — ${d.description}`).join("\n"),
    "",
    "FORECASTS:",
    forecasts
      .slice(0, 3)
      .map((f) => `- ${f.forecastType} at ${f.siteName}: ${f.predictedMeals} meals`)
      .join("\n"),
    "",
    "RECOMMENDATIONS:",
    recommendations
      .slice(0, 3)
      .map((r) => `- ${r.title}: ${r.description}`)
      .join("\n"),
  ].join("\n");

  return { context, citations };
}
