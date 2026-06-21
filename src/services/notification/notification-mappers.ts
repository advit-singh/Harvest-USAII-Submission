import type { HarvestNotification, NotificationSeverity, NotificationType } from "@/types/notification";

export function severityForNotificationType(type: NotificationType): NotificationSeverity {
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

export function mapNotificationRow(row: {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: Date;
  metadata: unknown;
}): HarvestNotification {
  const metadata = (row.metadata ?? {}) as { href?: string };
  const type = row.type as NotificationType;

  return {
    id: row.id,
    type,
    severity: severityForNotificationType(type),
    title: row.title,
    message: row.message,
    href: metadata.href,
    isRead: row.is_read,
    createdAt: row.created_at.toISOString(),
  };
}
