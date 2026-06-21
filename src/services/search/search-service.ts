import { and, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db/client";
import {
  conversations,
  forecasts,
  inventory_items,
  recommendations,
  reports,
  uploads,
} from "@/db/schema";

export interface SearchResultItem {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  href: string;
}

export interface SearchResults {
  inventory: SearchResultItem[];
  forecasts: SearchResultItem[];
  reports: SearchResultItem[];
  recommendations: SearchResultItem[];
  uploads: SearchResultItem[];
  conversations: SearchResultItem[];
}

export async function searchOrganization(
  organizationId: string,
  userId: string,
  query: string,
): Promise<SearchResults> {
  const pattern = `%${query.trim()}%`;
  if (!query.trim()) {
    throw new Error("QUERY_REQUIRED");
  }

  const [inventoryRows, forecastRows, reportRows, recommendationRows, uploadRows, conversationRows] =
    await Promise.all([
      db
        .select()
        .from(inventory_items)
        .where(
          and(
            eq(inventory_items.organization_id, organizationId),
            ilike(inventory_items.name, pattern),
          ),
        )
        .limit(10),
      db
        .select()
        .from(forecasts)
        .where(
          and(
            eq(forecasts.organization_id, organizationId),
            or(
              ilike(forecasts.forecast_type, pattern),
              ilike(forecasts.explanation, pattern),
            ),
          ),
        )
        .limit(10),
      db
        .select()
        .from(reports)
        .where(
          and(
            eq(reports.organization_id, organizationId),
            ilike(reports.report_type, pattern),
          ),
        )
        .limit(10),
      db
        .select()
        .from(recommendations)
        .where(
          and(
            eq(recommendations.organization_id, organizationId),
            or(
              ilike(recommendations.title, pattern),
              ilike(recommendations.description, pattern),
            ),
          ),
        )
        .limit(10),
      db
        .select()
        .from(uploads)
        .where(
          and(
            eq(uploads.organization_id, organizationId),
            ilike(uploads.file_name, pattern),
          ),
        )
        .limit(10),
      db
        .select()
        .from(conversations)
        .where(
          and(
            eq(conversations.organization_id, organizationId),
            eq(conversations.user_id, userId),
            ilike(conversations.title, pattern),
          ),
        )
        .limit(10),
    ]);

  return {
    inventory: inventoryRows.map((row) => ({
      id: row.id,
      type: "inventory",
      title: row.name,
      subtitle: row.unit_type ?? undefined,
      href: `/analytics?tab=inventory`,
    })),
    forecasts: forecastRows.map((row) => ({
      id: row.id,
      type: "forecast",
      title: `${row.forecast_type} forecast`,
      subtitle: row.explanation ?? undefined,
      href: `/predictions?tab=explorer&id=${row.id}`,
    })),
    reports: reportRows.map((row) => ({
      id: row.id,
      type: "report",
      title: row.report_type,
      subtitle: row.status,
      href: `/reports?tab=generated&id=${row.id}`,
    })),
    recommendations: recommendationRows.map((row) => ({
      id: row.id,
      type: "recommendation",
      title: row.title,
      subtitle: row.recommendation_type,
      href: `/predictions?tab=recommendations&id=${row.id}`,
    })),
    uploads: uploadRows.map((row) => ({
      id: row.id,
      type: "upload",
      title: row.file_name,
      subtitle: row.processing_status,
      href: `/uploads?tab=history&id=${row.id}`,
    })),
    conversations: conversationRows.map((row) => ({
      id: row.id,
      type: "conversation",
      title: row.title ?? "Conversation",
      href: `/assistant?conversationId=${row.id}`,
    })),
  };
}
