"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchNotifications } from "@/lib/api/notifications";
import { notificationKeys } from "@/features/notifications/hooks/notification-keys";

export function useNotifications(orgId: string | null) {
  return useQuery({
    queryKey: notificationKeys.list(orgId ?? ""),
    queryFn: () => fetchNotifications({ orgId: orgId! }),
    enabled: Boolean(orgId),
    refetchInterval: 60_000,
  });
}
