"use client";

import { NotificationItem } from "@/features/notifications/components/NotificationItem";
import { NotificationEmptyState } from "@/features/notifications/components/NotificationEmptyState";
import type { HarvestNotification } from "@/types/notification";

interface NotificationListProps {
  notifications: HarvestNotification[];
  onMarkRead: (id: string) => void;
}

export function NotificationList({
  notifications,
  onMarkRead,
}: NotificationListProps) {
  if (notifications.length === 0) {
    return <NotificationEmptyState />;
  }

  return (
    <ul className="max-h-80 space-y-1 overflow-y-auto" role="list">
      {notifications.map((notification) => (
        <li key={notification.id}>
          <NotificationItem
            notification={notification}
            onRead={onMarkRead}
          />
        </li>
      ))}
    </ul>
  );
}
