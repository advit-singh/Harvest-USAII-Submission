import { apiClient } from "@/lib/api/client";
import {
  getMockOrganizationSettings,
  setMockOrganizationSettings,
} from "@/lib/mocks/settings-fixtures";
import type {
  OrganizationSettings,
  OrganizationSettingsPatch,
} from "@/types/settings";

export async function fetchOrganizationSettings(
  orgId: string,
): Promise<OrganizationSettings> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_API !== "false") {
    await new Promise((r) => setTimeout(r, 120));
    return getMockOrganizationSettings(orgId);
  }
  return apiClient<OrganizationSettings>(`/organizations/${orgId}/settings`);
}

export async function updateOrganizationSettings(
  orgId: string,
  patch: OrganizationSettingsPatch,
): Promise<OrganizationSettings> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_API !== "false") {
    await new Promise((r) => setTimeout(r, 200));
    const current = getMockOrganizationSettings(orgId);
    const updated: OrganizationSettings = {
      ...current,
      ai: patch.ai ? { ...current.ai, ...patch.ai } : current.ai,
      forecast: patch.forecast
        ? { ...current.forecast, ...patch.forecast }
        : current.forecast,
      notifications: patch.notifications
        ? { ...current.notifications, ...patch.notifications }
        : current.notifications,
      dashboardLayout:
        patch.dashboardLayout !== undefined
          ? patch.dashboardLayout
          : current.dashboardLayout,
      updatedAt: new Date().toISOString(),
    };
    setMockOrganizationSettings(orgId, updated);
    return updated;
  }
  return apiClient<OrganizationSettings>(`/organizations/${orgId}/settings`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}
