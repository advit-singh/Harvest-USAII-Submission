import { db } from "@/db/client";
import { organization_settings } from "@/db/schema";
import { recordAuditLog } from "@/services/platform/audit-service";
import { buildDefaultSettingsJson } from "@/services/platform/default-settings";
import type { OrganizationSettings, OrganizationSettingsPatch } from "@/types/settings";

function parseSettingsJson(
  organizationId: string,
  settingsJson: unknown,
  updatedAt: Date,
): OrganizationSettings {
  const defaults = buildDefaultSettingsJson(organizationId);
  const stored = (settingsJson ?? {}) as Partial<OrganizationSettings>;

  return {
    organizationId,
    ai: { ...defaults.ai, ...stored.ai },
    forecast: { ...defaults.forecast, ...stored.forecast },
    notifications: { ...defaults.notifications, ...stored.notifications },
    dashboardLayout: stored.dashboardLayout ?? defaults.dashboardLayout,
    updatedAt: updatedAt.toISOString(),
  };
}

export async function getOrganizationSettings(
  organizationId: string,
): Promise<OrganizationSettings> {
  const row = await db.query.organization_settings.findFirst({
    where: (fields, { eq: eqFn }) => eqFn(fields.organization_id, organizationId),
  });

  if (!row) {
    const defaults = buildDefaultSettingsJson(organizationId);
    const [created] = await db
      .insert(organization_settings)
      .values({
        organization_id: organizationId,
        settings_json: defaults,
      })
      .returning();
    return parseSettingsJson(organizationId, created!.settings_json, created!.updated_at);
  }

  return parseSettingsJson(organizationId, row.settings_json, row.updated_at);
}

export async function updateOrganizationSettings(
  organizationId: string,
  patch: OrganizationSettingsPatch,
  userId: string,
): Promise<OrganizationSettings> {
  const current = await getOrganizationSettings(organizationId);

  const updated: OrganizationSettings = {
    ...current,
    ai: patch.ai ? { ...current.ai, ...patch.ai } : current.ai,
    forecast: patch.forecast ? { ...current.forecast, ...patch.forecast } : current.forecast,
    notifications: patch.notifications
      ? { ...current.notifications, ...patch.notifications }
      : current.notifications,
    dashboardLayout:
      patch.dashboardLayout !== undefined ? patch.dashboardLayout : current.dashboardLayout,
    updatedAt: new Date().toISOString(),
  };

  const [row] = await db
    .insert(organization_settings)
    .values({
      organization_id: organizationId,
      settings_json: updated,
      created_by: userId,
    })
    .onConflictDoUpdate({
      target: organization_settings.organization_id,
      set: {
        settings_json: updated,
        updated_at: new Date(),
        created_by: userId,
      },
    })
    .returning();

  await recordAuditLog({
    organizationId,
    userId,
    entityType: "organization_settings",
    entityId: row!.id,
    action: "updated",
    oldValue: current as unknown as Record<string, unknown>,
    newValue: updated as unknown as Record<string, unknown>,
  });

  return parseSettingsJson(organizationId, row!.settings_json, row!.updated_at);
}

export async function getNotificationPreferences(organizationId: string) {
  const settings = await getOrganizationSettings(organizationId);
  return settings.notifications;
}
