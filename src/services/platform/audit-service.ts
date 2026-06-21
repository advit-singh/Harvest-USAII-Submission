import { db } from "@/db/client";
import { audit_logs } from "@/db/schema";

export interface AuditLogInput {
  organizationId: string;
  userId?: string;
  entityType: string;
  entityId: string;
  action: string;
  oldValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
}

export interface AuditLogFilters {
  organizationId: string;
  userId?: string;
  entityType?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

export interface AuditLogEntry {
  id: string;
  organizationId: string;
  userId: string | null;
  entityType: string;
  entityId: string;
  action: string;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  timestamp: string;
}

export async function recordAuditLog(input: AuditLogInput): Promise<void> {
  await db.insert(audit_logs).values({
    organization_id: input.organizationId,
    user_id: input.userId ?? null,
    entity_type: input.entityType,
    entity_id: input.entityId,
    action: input.action,
    old_value: input.oldValue ?? null,
    new_value: input.newValue ?? null,
    created_by: input.userId ?? null,
  });
}

export async function listAuditLogs(filters: AuditLogFilters): Promise<AuditLogEntry[]> {
  const rows = await db.query.audit_logs.findMany({
    where: (fields, { and: andFn, eq: eqFn, gte, lte }) => {
      const conditions = [eqFn(fields.organization_id, filters.organizationId)];
      if (filters.userId) {
        conditions.push(eqFn(fields.user_id, filters.userId));
      }
      if (filters.entityType) {
        conditions.push(eqFn(fields.entity_type, filters.entityType));
      }
      if (filters.action) {
        conditions.push(eqFn(fields.action, filters.action));
      }
      if (filters.startDate) {
        conditions.push(gte(fields.timestamp, filters.startDate));
      }
      if (filters.endDate) {
        conditions.push(lte(fields.timestamp, filters.endDate));
      }
      return andFn(...conditions);
    },
    orderBy: (fields, { desc: descFn }) => [descFn(fields.timestamp)],
    limit: filters.limit ?? 100,
  });

  return rows.map((row) => ({
    id: row.id,
    organizationId: row.organization_id,
    userId: row.user_id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    action: row.action,
    oldValue: (row.old_value as Record<string, unknown> | null) ?? null,
    newValue: (row.new_value as Record<string, unknown> | null) ?? null,
    timestamp: row.timestamp.toISOString(),
  }));
}

export async function getAuditLogById(id: string, organizationId: string) {
  const row = await db.query.audit_logs.findFirst({
    where: (fields, { and: andFn, eq: eqFn }) =>
      andFn(eqFn(fields.id, id), eqFn(fields.organization_id, organizationId)),
  });
  return row;
}
