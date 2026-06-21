import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { forecasts, recommendations, waste_events } from "@/db/schema";
import { toApiConfidence } from "@/lib/api/confidence";
import {
  getAttendanceAnalytics,
  getDashboardOverview,
  getDonationAnalytics,
  getImpactAnalytics,
  getInventoryAnalytics,
  getWasteAnalytics,
} from "@/services/analytics/analytics-service";
import type { AssistantCitation } from "@/types/assistant";
import type { AnalyticsFilters } from "@/types/analytics";
import { citationHref, type RetrievalBundle, type RetrievalScope } from "./assistant-types";

function buildFilters(scope: RetrievalScope): AnalyticsFilters {
  return {
    timeRange: "month",
    siteId: scope.siteId ?? null,
    hierarchyLevel: "kitchen",
    hierarchyId: scope.siteId ?? null,
    category: null,
    eventId: null,
  };
}

export async function retrieveOrganizationContext(scope: RetrievalScope): Promise<RetrievalBundle> {
  const filters = buildFilters(scope);
  const citations: AssistantCitation[] = [];

  const [overview, waste, inventory, attendance, donations, impact, forecastRows, recommendationRows] =
    await Promise.all([
      getDashboardOverview(scope.organizationId),
      getWasteAnalytics(scope.organizationId, filters),
      getInventoryAnalytics(scope.organizationId, filters),
      getAttendanceAnalytics(scope.organizationId, filters),
      getDonationAnalytics(scope.organizationId, filters),
      getImpactAnalytics(scope.organizationId, filters),
      db
        .select()
        .from(forecasts)
        .where(eq(forecasts.organization_id, scope.organizationId))
        .orderBy(desc(forecasts.created_at))
        .limit(3),
      db
        .select()
        .from(recommendations)
        .where(
          and(
            eq(recommendations.organization_id, scope.organizationId),
            eq(recommendations.status, "open"),
          ),
        )
        .orderBy(desc(recommendations.created_at))
        .limit(3),
    ]);

  const wasteTotal = waste.summary[0]?.value ?? 0;
  const topDriver = waste.rootCause.drivers[0]?.name ?? "unknown";
  citations.push({
    id: "cite_waste",
    sourceType: "waste",
    title: "Waste analytics",
    excerpt: `Total waste ${wasteTotal} kg; top driver ${topDriver}.`,
    href: citationHref("waste"),
  });

  if (forecastRows[0]) {
    citations.push({
      id: `cite_fc_${forecastRows[0].id}`,
      sourceType: "forecast",
      title: `${forecastRows[0].forecast_type} forecast`,
      excerpt: forecastRows[0].explanation?.slice(0, 120) ?? "Latest forecast available.",
      href: citationHref("forecast", forecastRows[0].id),
      recordId: forecastRows[0].id,
      confidence: toApiConfidence(forecastRows[0].confidence_score),
    });
  }

  for (const rec of recommendationRows) {
    citations.push({
      id: `cite_rec_${rec.id}`,
      sourceType: "recommendation",
      title: rec.title,
      excerpt: (rec.description ?? rec.title).slice(0, 120),
      href: citationHref("recommendation", rec.id),
      recordId: rec.id,
      confidence: toApiConfidence(rec.confidence_score),
    });
  }

  const recentWaste = await db
    .select({ quantity: waste_events.quantity, reason: waste_events.waste_reason })
    .from(waste_events)
    .where(eq(waste_events.organization_id, scope.organizationId))
    .orderBy(desc(waste_events.waste_date))
    .limit(5);

  return {
    wasteSummary: `Risk ${overview.riskLevel} (${overview.riskScore}). Waste total ${wasteTotal} kg. Drivers: ${waste.rootCause.summary}. Recent events: ${recentWaste.map((row) => `${row.quantity} (${row.reason})`).join(", ") || "none"}.`,
    inventorySummary: `Turnover ${inventory.turnoverRate}, storage utilization ${inventory.storageUtilization}%, expiration risk items ${inventory.expirationRisk.length}.`,
    attendanceSummary: `Forecast accuracy ${Math.round(attendance.forecastAccuracy * 100)}%.`,
    forecastSummary: forecastRows
      .map(
        (row) =>
          `${row.forecast_type}: ${row.predicted_value} (${toApiConfidence(row.confidence_score)} confidence) — ${row.explanation?.slice(0, 80) ?? ""}`,
      )
      .join(" | "),
    recommendationSummary: recommendationRows
      .map(
        (row) =>
          `${row.title} (${row.priority}, ${toApiConfidence(row.confidence_score)} confidence)`,
      )
      .join(" | "),
    donationSummary: `Meals rescued ${donations.mealsRescued}, success rate ${Math.round(donations.successRate * 100)}%.`,
    impactSummary: impact.summary
      .map((metric) => `${metric.label}: ${metric.value}${metric.unit ? metric.unit : ""}`)
      .join(" | "),
    citations,
  };
}
