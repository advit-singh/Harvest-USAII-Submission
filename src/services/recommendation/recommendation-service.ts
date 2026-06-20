import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import {
  organization_sites,
  recommendation_actions,
  recommendation_factors,
  recommendations,
} from "@/db/schema";
import type { RecommendationAction } from "@/types/recommendation";
import {
  mapRecommendation,
  mapRecommendationDetail,
} from "@/services/recommendation/recommendation-mappers";

export interface ListRecommendationsInput {
  organizationId: string;
  status?: string;
  priority?: string;
  siteId?: string;
  limit?: number;
}

const ACTION_STATUS_MAP: Record<RecommendationAction, string> = {
  accepted: "accepted",
  rejected: "rejected",
  completed: "completed",
  snoozed: "snoozed",
};

export async function listRecommendations(input: ListRecommendationsInput) {
  const conditions = [eq(recommendations.organization_id, input.organizationId)];
  if (input.status && input.status !== "all") {
    conditions.push(eq(recommendations.status, input.status));
  }
  if (input.priority && input.priority !== "all") {
    conditions.push(eq(recommendations.priority, input.priority));
  }
  if (input.siteId) {
    conditions.push(eq(recommendations.site_id, input.siteId));
  }

  const rows = await db
    .select()
    .from(recommendations)
    .where(and(...conditions))
    .orderBy(desc(recommendations.created_at))
    .limit(input.limit ?? 50);

  const siteNames = await loadSiteNameMap(input.organizationId);
  return rows.map((row) =>
    mapRecommendation(row, siteNames.get(row.site_id) ?? "Unknown Site"),
  );
}

export async function getRecommendationById(id: string, organizationId: string) {
  const row = await db.query.recommendations.findFirst({
    where: (fields, { and: andFn, eq: eqFn }) =>
      andFn(eqFn(fields.id, id), eqFn(fields.organization_id, organizationId)),
  });

  if (!row) return null;

  const [site, factors, assignee] = await Promise.all([
    db.query.organization_sites.findFirst({
      where: (fields, { eq: eqFn }) => eqFn(fields.id, row.site_id),
    }),
    db
      .select()
      .from(recommendation_factors)
      .where(eq(recommendation_factors.recommendation_id, id)),
    row.assignee_id
      ? db.query.users.findFirst({
          where: (fields, { eq: eqFn }) => eqFn(fields.id, row.assignee_id!),
        })
      : Promise.resolve(null),
  ]);

  const assigneeName = assignee
    ? `${assignee.first_name ?? ""} ${assignee.last_name ?? ""}`.trim() || assignee.email
    : null;

  return mapRecommendationDetail(row, site?.name ?? "Unknown Site", factors, assigneeName);
}

export async function submitRecommendationAction(
  id: string,
  organizationId: string,
  userId: string,
  action: RecommendationAction,
  notes?: string,
) {
  const row = await db.query.recommendations.findFirst({
    where: (fields, { and: andFn, eq: eqFn }) =>
      andFn(eqFn(fields.id, id), eqFn(fields.organization_id, organizationId)),
  });

  if (!row) return null;

  const newStatus = ACTION_STATUS_MAP[action];
  await db.insert(recommendation_actions).values({
    recommendation_id: id,
    user_id: userId,
    action_type: action,
    notes,
    created_by: userId,
  });

  const [updated] = await db
    .update(recommendations)
    .set({ status: newStatus, updated_at: new Date() })
    .where(eq(recommendations.id, id))
    .returning();

  const site = await db.query.organization_sites.findFirst({
    where: (fields, { eq: eqFn }) => eqFn(fields.id, updated.site_id),
  });

  return mapRecommendation(updated, site?.name ?? "Unknown Site");
}

export async function assignRecommendation(
  id: string,
  organizationId: string,
  assigneeId: string,
  dueDate?: string,
) {
  const assignee = await db.query.users.findFirst({
    where: (fields, { eq: eqFn }) => eqFn(fields.id, assigneeId),
  });

  if (!assignee) {
    throw new Error("Assignee not found.");
  }

  const [updated] = await db
    .update(recommendations)
    .set({
      assignee_id: assigneeId,
      due_date: dueDate ? new Date(dueDate) : null,
      updated_at: new Date(),
    })
    .where(and(eq(recommendations.id, id), eq(recommendations.organization_id, organizationId)))
    .returning();

  if (!updated) return null;

  return getRecommendationById(id, organizationId);
}

async function loadSiteNameMap(organizationId: string) {
  const sites = await db
    .select({ id: organization_sites.id, name: organization_sites.name })
    .from(organization_sites)
    .where(eq(organization_sites.organization_id, organizationId));

  return new Map(sites.map((site) => [site.id, site.name]));
}
