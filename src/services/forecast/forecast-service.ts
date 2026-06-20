import { and, desc, eq, gte, lte } from "drizzle-orm";
import { db } from "@/db/client";
import {
  forecast_factors,
  forecasts,
  organization_sites,
  recommendations,
} from "@/db/schema";
import type { ForecastType } from "@/types/forecast";
import type { ForecastSummaryKpis } from "@/types/predictions";
import { loadOperationalSnapshot } from "@/services/intelligence/operational-data-loader";
import { enrichForecastWithAi } from "@/services/forecast/forecast-ai";
import { computeForecast } from "@/services/forecast/forecast-models";
import {
  dbConfidenceFromComputation,
  mapForecastDetail,
  mapForecastSummary,
  mapForecastSummaryKpis,
} from "@/services/forecast/forecast-mappers";
import { generateRecommendationsFromForecast } from "@/services/recommendation/recommendation-engine";

export interface ListForecastsInput {
  organizationId: string;
  forecastType?: string;
  siteId?: string;
  startDate?: string;
  endDate?: string;
}

export interface GenerateForecastInput {
  organizationId: string;
  siteId: string;
  forecastType: ForecastType;
  days: number;
  createdBy?: string;
}

export async function listForecasts(input: ListForecastsInput) {
  const conditions = [eq(forecasts.organization_id, input.organizationId)];
  if (input.forecastType) conditions.push(eq(forecasts.forecast_type, input.forecastType));
  if (input.siteId) conditions.push(eq(forecasts.site_id, input.siteId));
  if (input.startDate) conditions.push(gte(forecasts.forecast_date, new Date(input.startDate)));
  if (input.endDate) conditions.push(lte(forecasts.forecast_date, new Date(input.endDate)));

  const rows = await db
    .select()
    .from(forecasts)
    .where(and(...conditions))
    .orderBy(desc(forecasts.created_at))
    .limit(100);

  const siteNames = await loadSiteNameMap(input.organizationId);

  return Promise.all(
    rows.map(async (row) => {
      const extras = await buildExtrasForForecast(row);
      return mapForecastSummary(
        row,
        siteNames.get(row.site_id) ?? "Unknown Site",
        extras.historyPoints,
        extras.trend,
      );
    }),
  );
}

export async function getForecastById(forecastId: string, organizationId: string) {
  const row = await db.query.forecasts.findFirst({
    where: (fields, { and: andFn, eq: eqFn }) =>
      andFn(eqFn(fields.id, forecastId), eqFn(fields.organization_id, organizationId)),
  });

  if (!row) return null;

  const site = await db.query.organization_sites.findFirst({
    where: (fields, { eq: eqFn }) => eqFn(fields.id, row.site_id),
  });

  const factors = await db
    .select()
    .from(forecast_factors)
    .where(eq(forecast_factors.forecast_id, forecastId));

  const linkedRecs = await db
    .select({ id: recommendations.id })
    .from(recommendations)
    .where(eq(recommendations.forecast_id, forecastId));

  const extras = await buildExtrasForForecast(row);

  return mapForecastDetail(
    row,
    site?.name ?? "Unknown Site",
    factors.map((factor) => ({
      name: factor.factor_name,
      impactWeight: Number(factor.impact_weight ?? 0),
      description: factor.description ?? "",
    })),
    linkedRecs.map((rec) => rec.id),
    extras,
  );
}

export async function getForecastSummaryKpis(
  organizationId: string,
  siteId?: string,
): Promise<ForecastSummaryKpis> {
  const horizon = await getDefaultHorizonDays(organizationId);
  const site = siteId
    ? await db.query.organization_sites.findFirst({
        where: (fields, { eq: eqFn }) => eqFn(fields.id, siteId),
      })
    : await db.query.organization_sites.findFirst({
        where: (fields, { eq: eqFn }) => eqFn(fields.organization_id, organizationId),
      });

  if (!site) {
    return {
      predictedSurplusMeals: 0,
      predictedWasteMeals: 0,
      expirationRiskItems: 0,
      attendanceForecast: 0,
      purchasingForecast: 0,
      confidence: 0,
      forecastWindowDays: horizon,
      siteName: "",
    };
  }

  const snapshot = await loadOperationalSnapshot({
    organizationId,
    siteId: site.id,
    windowDays: horizon,
  });

  const [surplus, waste, demand] = await Promise.all(
    (["surplus", "waste", "demand"] as ForecastType[]).map((type) =>
      getLatestForecast(organizationId, site.id, type),
    ),
  );

  return mapForecastSummaryKpis({
    siteName: site.name,
    windowDays: horizon,
    surplusForecast: surplus,
    wasteForecast: waste,
    demandForecast: demand,
    expirationRiskItems: snapshot.expirationRiskItems,
  });
}

export async function generateForecast(input: GenerateForecastInput) {
  const snapshot = await loadOperationalSnapshot({
    organizationId: input.organizationId,
    siteId: input.siteId,
    windowDays: input.days,
  });

  let computation = computeForecast(input.forecastType, snapshot, input.days);
  computation = await enrichForecastWithAi(computation, snapshot);

  const [forecast] = await db
    .insert(forecasts)
    .values({
      organization_id: input.organizationId,
      site_id: input.siteId,
      forecast_type: input.forecastType,
      forecast_date: new Date(),
      prediction_window: input.days,
      predicted_value: String(computation.predictedValue),
      confidence_score: dbConfidenceFromComputation(computation.confidence),
      explanation: computation.explanation,
      created_by: input.createdBy,
    })
    .returning();

  if (computation.factors.length > 0) {
    await db.insert(forecast_factors).values(
      computation.factors.map((factor) => ({
        forecast_id: forecast.id,
        factor_name: factor.name,
        impact_weight: String(factor.impactWeight),
        description: factor.description,
        created_by: input.createdBy,
      })),
    );
  }

  await generateRecommendationsFromForecast({
    forecastId: forecast.id,
    organizationId: input.organizationId,
    siteId: input.siteId,
    computation,
    snapshot,
    createdBy: input.createdBy,
  });

  return { forecastId: forecast.id };
}

export async function generateAllForecastTypes(
  organizationId: string,
  siteId: string,
  createdBy?: string,
) {
  const days = await getDefaultHorizonDays(organizationId);
  const types: ForecastType[] = ["surplus", "waste", "demand"];
  for (const forecastType of types) {
    await generateForecast({ organizationId, siteId, forecastType, days, createdBy });
  }
}

async function buildExtrasForForecast(row: typeof forecasts.$inferSelect) {
  const snapshot = await loadOperationalSnapshot({
    organizationId: row.organization_id,
    siteId: row.site_id,
    windowDays: row.prediction_window,
  });
  const computation = computeForecast(
    row.forecast_type as ForecastType,
    snapshot,
    row.prediction_window,
  );
  return {
    predictedWasteMeals: computation.predictedWasteMeals,
    expirationRiskItems: computation.expirationRiskItems,
    attendanceForecast: computation.attendanceForecast,
    purchasingForecast: computation.purchasingForecast,
    historyPoints: computation.historyPoints,
    trend: computation.trend,
  };
}

async function getLatestForecast(
  organizationId: string,
  siteId: string,
  forecastType: ForecastType,
) {
  const rows = await db
    .select()
    .from(forecasts)
    .where(
      and(
        eq(forecasts.organization_id, organizationId),
        eq(forecasts.site_id, siteId),
        eq(forecasts.forecast_type, forecastType),
      ),
    )
    .orderBy(desc(forecasts.created_at))
    .limit(1);
  return rows[0] ?? null;
}

async function getDefaultHorizonDays(organizationId: string): Promise<number> {
  const settings = await db.query.organization_settings.findFirst({
    where: (fields, { eq: eqFn }) => eqFn(fields.organization_id, organizationId),
  });
  const json = settings?.settings_json as { forecast?: { defaultHorizonDays?: number } } | null;
  return json?.forecast?.defaultHorizonDays ?? 7;
}

async function loadSiteNameMap(organizationId: string) {
  const sites = await db
    .select({ id: organization_sites.id, name: organization_sites.name })
    .from(organization_sites)
    .where(eq(organization_sites.organization_id, organizationId));

  return new Map(sites.map((site) => [site.id, site.name]));
}
