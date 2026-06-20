"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/api/notifications";
import { notificationKeys } from "@/features/notifications/hooks/notification-keys";
import { useNotificationStore } from "@/store/notification-store";

export function useMarkNotificationRead(orgId: string | null) {
  const queryClient = useQueryClient();
  const decrementUnread = useNotificationStore((s) => s.decrementUnread);

  return useMutation({
    mutationFn: (notificationId: string) =>
      markNotificationRead(notificationId),
    onSuccess: () => {
      decrementUnread();
      if (orgId) {
        queryClient.invalidateQueries({
          queryKey: notificationKeys.list(orgId),
        });
      }
    },
  });
}

export function useMarkAllNotificationsRead(orgId: string | null) {
  const queryClient = useQueryClient();
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);

  return useMutation({
    mutationFn: () => markAllNotificationsRead(orgId!),
    onSuccess: () => {
      setUnreadCount(0);
      if (orgId) {
        queryClient.invalidateQueries({
          queryKey: notificationKeys.list(orgId),
        });
      }
    },
  });
}
