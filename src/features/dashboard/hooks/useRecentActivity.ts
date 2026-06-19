"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchNotifications } from "@/lib/api/notifications";

export const activityKeys = {
  all: ["activity"] as const,
  recent: (orgId: string) => [...activityKeys.all, orgId] as const,
};

export function useRecentActivity(orgId: string | null, limit = 10) {
  return useQuery({
    queryKey: [...activityKeys.recent(orgId ?? ""), limit],
    queryFn: () => fetchNotifications({ orgId: orgId!, limit }),
    enabled: Boolean(orgId),
    staleTime: 30_000,
  });
}
