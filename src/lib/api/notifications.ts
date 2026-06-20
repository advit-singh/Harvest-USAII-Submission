import { apiClient } from "@/lib/api/client";
import { getMockNotifications } from "@/lib/mocks/dashboard-fixtures";
import {
  getMockOrganizationSettings,
} from "@/lib/mocks/settings-fixtures";
import type { HarvestNotification, NotificationSeverity } from "@/types/notification";

export interface NotificationFilters {
  orgId: string;
  limit?: number;
}

let mockNotificationsState: HarvestNotification[] | null = null;

function getNotificationsState(): HarvestNotification[] {
  if (!mockNotificationsState) {
    mockNotificationsState = getMockNotifications().map((n) => ({ ...n }));
  }
  return mockNotificationsState;
}

export function resetMockNotifications(): void {
  mockNotificationsState = null;
}

function filterByPreferences(
  items: HarvestNotification[],
  orgId: string,
): HarvestNotification[] {
  const prefs = getMockOrganizationSettings(orgId).notifications;
  return items.filter((item) => {
    if (item.severity === "critical" && !prefs.critical) return false;
    if (item.severity === "warning" && !prefs.warning) return false;
    if (item.severity === "informational" && !prefs.informational) return false;
    return true;
  });
}

export async function fetchNotifications(
  filters: NotificationFilters,
): Promise<HarvestNotification[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_API !== "false") {
    await new Promise((r) => setTimeout(r, 150));
    const filtered = filterByPreferences(getNotificationsState(), filters.orgId);
    return filters.limit ? filtered.slice(0, filters.limit) : filtered;
  }

  const params = new URLSearchParams({ organizationId: filters.orgId });
  if (filters.limit) params.set("limit", String(filters.limit));

  return apiClient<HarvestNotification[]>(
    `/notifications?${params.toString()}`,
  );
}

export async function markNotificationRead(
  notificationId: string,
): Promise<{ id: string; isRead: boolean }> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_API !== "false") {
    await new Promise((r) => setTimeout(r, 80));
    const items = getNotificationsState();
    const index = items.findIndex((n) => n.id === notificationId);
    if (index >= 0) {
      items[index] = { ...items[index], isRead: true };
    }
    return { id: notificationId, isRead: true };
  }
  return apiClient<{ id: string; isRead: boolean }>(
    `/notifications/${notificationId}/read`,
    { method: "PATCH" },
  );
}

export async function markAllNotificationsRead(
  orgId: string,
): Promise<{ updatedCount: number }> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_API !== "false") {
    await new Promise((r) => setTimeout(r, 100));
    const items = getNotificationsState();
    const allowed = new Set(
      filterByPreferences(items, orgId).map((n) => n.id),
    );
    let updatedCount = 0;
    mockNotificationsState = items.map((n) => {
      if (allowed.has(n.id) && !n.isRead) {
        updatedCount += 1;
        return { ...n, isRead: true };
      }
      return n;
    });
    return { updatedCount };
  }
  const params = new URLSearchParams({ organizationId: orgId });
  return apiClient<{ updatedCount: number }>(
    `/notifications/read-all?${params.toString()}`,
    { method: "PATCH" },
  );
}

export function countUnreadNotifications(
  items: HarvestNotification[],
): number {
  return items.filter((n) => !n.isRead).length;
}

export function severityForType(
  type: HarvestNotification["type"],
): NotificationSeverity {
  switch (type) {
    case "validation.warning":
      return "critical";
    case "forecast.generated":
    case "assignment.received":
      return "warning";
    default:
      return "informational";
  }
}
