import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { organization_sites, reports, users } from "@/db/schema";
import type {
  GenerateReportPayload,
  ReportDetail,
  ReportDownloadResponse,
  ReportFilters,
  ReportSummary,
  ReportTemplate,
} from "@/types/report";
import { collectReportData } from "./report-data-service";
import { renderReportFile } from "./report-generator";
import {
  formatUserName,
  mapDownloadResponse,
  mapGenerateResponse,
  mapReportDetail,
  mapReportSummary,
} from "./report-mappers";
import { createReportDownloadUrl, uploadReportFile } from "./report-storage";
import { getReportTemplate, getTemplateName, isFormatSupported, listReportTemplates } from "./template-registry";
import { notifyReportGenerated } from "@/services/notification/notification-emitter";

export function getTemplates(): ReportTemplate[] {
  return listReportTemplates();
}

export async function listReports(filters: ReportFilters): Promise<ReportSummary[]> {
  const conditions = [eq(reports.organization_id, filters.organizationId)];
  if (filters.status && filters.status !== "all") {
    conditions.push(eq(reports.status, filters.status));
  }
  if (filters.template && filters.template !== "all") {
    conditions.push(eq(reports.report_type, filters.template));
  }
  if (filters.siteId && filters.siteId !== "all") {
    conditions.push(eq(reports.site_id, filters.siteId));
  }

  const rows = await db
    .select()
    .from(reports)
    .where(and(...conditions))
    .orderBy(desc(reports.created_at))
    .limit(100);

  const [siteMap, userMap] = await Promise.all([
    loadSiteNameMap(filters.organizationId),
    loadUserNameMap(rows.map((row) => row.generated_by)),
  ]);

  return rows.map((row) =>
    mapReportSummary(
      row,
      siteMap.get(row.site_id ?? "") ?? "All Sites",
      userMap.get(row.generated_by) ?? "Unknown User",
    ),
  );
}

export async function getReportById(
  id: string,
  organizationId: string,
): Promise<ReportDetail | null> {
  const row = await db.query.reports.findFirst({
    where: (fields, { and: andFn, eq: eqFn }) =>
      andFn(eqFn(fields.id, id), eqFn(fields.organization_id, organizationId)),
  });
  if (!row) return null;

  const [site, user] = await Promise.all([
    row.site_id
      ? db.query.organization_sites.findFirst({
          where: (fields, { eq: eqFn }) => eqFn(fields.id, row.site_id!),
        })
      : Promise.resolve(null),
    db.query.users.findFirst({
      where: (fields, { eq: eqFn }) => eqFn(fields.id, row.generated_by),
    }),
  ]);

  return mapReportDetail(row, site?.name ?? "All Sites", formatUserName(user));
}

export async function queueReportGeneration(
  payload: GenerateReportPayload,
  userId: string,
): Promise<ReturnType<typeof mapGenerateResponse>> {
  if (!getReportTemplate(payload.template)) {
    throw new Error("INVALID_TEMPLATE");
  }
  if (!isFormatSupported(payload.template, payload.format)) {
    throw new Error("INVALID_FORMAT");
  }

  const site = await db.query.organization_sites.findFirst({
    where: (fields, { and: andFn, eq: eqFn }) =>
      andFn(
        eqFn(fields.id, payload.siteId),
        eqFn(fields.organization_id, payload.organizationId),
      ),
  });
  if (!site) {
    throw new Error("INVALID_SITE");
  }

  const [row] = await db
    .insert(reports)
    .values({
      organization_id: payload.organizationId,
      site_id: payload.siteId,
      generated_by: userId,
      report_type: payload.template,
      format: payload.format,
      date_range: payload.dateRange,
      status: "queued",
      progress: 0,
      created_by: userId,
    })
    .returning();

  void runReportGeneration(row.id, payload, site.name, userId);

  return mapGenerateResponse(row);
}

async function runReportGeneration(
  reportId: string,
  payload: GenerateReportPayload,
  siteName: string,
  userId: string,
): Promise<void> {
  try {
    await updateReportProgress(reportId, "generating", 20);

    const content = await collectReportData({
      organizationId: payload.organizationId,
      siteId: payload.siteId,
      siteName,
      template: payload.template,
      dateRange: payload.dateRange,
    });

    await updateReportProgress(reportId, "generating", 60);

    const file = await renderReportFile(content, payload.format, payload.dateRange.end);
    const storagePath = await uploadReportFile(
      payload.organizationId,
      reportId,
      file.fileName,
      file.buffer,
      file.mimeType,
    );

    await db
      .update(reports)
      .set({
        status: "ready",
        progress: 100,
        file_path: storagePath,
        generated_at: new Date(),
        updated_at: new Date(),
        error_message: null,
      })
      .where(eq(reports.id, reportId));

    void notifyReportGenerated({
      organizationId: payload.organizationId,
      userId,
      reportId,
      templateName: getTemplateName(payload.template),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Report generation failed.";
    await db
      .update(reports)
      .set({
        status: "failed",
        progress: 100,
        error_message: message,
        updated_at: new Date(),
      })
      .where(eq(reports.id, reportId));
  }
}

async function updateReportProgress(
  reportId: string,
  status: "generating" | "queued",
  progress: number,
): Promise<void> {
  await db
    .update(reports)
    .set({ status, progress, updated_at: new Date() })
    .where(eq(reports.id, reportId));
}

export async function downloadReport(
  id: string,
  organizationId: string,
): Promise<ReportDownloadResponse | null> {
  const row = await db.query.reports.findFirst({
    where: (fields, { and: andFn, eq: eqFn }) =>
      andFn(eqFn(fields.id, id), eqFn(fields.organization_id, organizationId)),
  });

  if (!row || row.status !== "ready" || !row.file_path) {
    return null;
  }

  const format = (row.format ?? "pdf") as ReportDownloadResponse["format"];
  const templateName = getTemplateName(row.report_type as GenerateReportPayload["template"]);
  const dateEnd =
    (row.date_range as GenerateReportPayload["dateRange"] | null)?.end ??
    new Date().toISOString().slice(0, 10);
  const fileName = `${templateName.toLowerCase().replace(/\s+/g, "-")}-${dateEnd}.${format}`;

  const { fileUrl, expiresAt } = await createReportDownloadUrl(row.file_path, fileName);
  return mapDownloadResponse(fileUrl, fileName, format, expiresAt);
}

async function loadSiteNameMap(organizationId: string): Promise<Map<string, string>> {
  const sites = await db
    .select({ id: organization_sites.id, name: organization_sites.name })
    .from(organization_sites)
    .where(eq(organization_sites.organization_id, organizationId));
  return new Map(sites.map((site) => [site.id, site.name]));
}

async function loadUserNameMap(userIds: string[]): Promise<Map<string, string>> {
  if (userIds.length === 0) return new Map();
  const uniqueIds = [...new Set(userIds)];
  const rows = await db.select().from(users).where(inArray(users.id, uniqueIds));
  return new Map(rows.map((user) => [user.id, formatUserName(user)]));
}
