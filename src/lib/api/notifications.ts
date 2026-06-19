import { apiClient } from "@/lib/api/client";
import { getMockNotifications } from "@/lib/mocks/dashboard-fixtures";
import type { HarvestNotification } from "@/types/notification";

export interface NotificationFilters {
  orgId: string;
  limit?: number;
}

export async function fetchNotifications(
  filters: NotificationFilters,
): Promise<HarvestNotification[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_API !== "false") {
    await new Promise((r) => setTimeout(r, 150));
    const items = getMockNotifications();
    return filters.limit ? items.slice(0, filters.limit) : items;
  }

  const params = new URLSearchParams({ organizationId: filters.orgId });
  if (filters.limit) params.set("limit", String(filters.limit));

  return apiClient<HarvestNotification[]>(
    `/notifications?${params.toString()}`,
  );
}
