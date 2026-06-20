/** API_SPEC §46 notifications — used for Recent Activity widget */

export type NotificationType =
  | "upload.completed"
  | "forecast.generated"
  | "recommendation.created"
  | "donation.completed"
  | "report.generated"
  | "assignment.received"
  | "validation.warning";

export type NotificationSeverity = "critical" | "warning" | "informational";

export interface HarvestNotification {
  id: string;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  href?: string;
  isRead: boolean;
  createdAt: string;
}
