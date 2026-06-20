import {
  AlertTriangle,
  Bell,
  Bot,
  FileText,
  HeartHandshake,
  Info,
  Upload,
  UserCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type {
  HarvestNotification,
  NotificationSeverity,
  NotificationType,
} from "@/types/notification";

export const NOTIFICATION_TYPE_ICONS: Record<NotificationType, LucideIcon> = {
  "upload.completed": Upload,
  "forecast.generated": Bot,
  "recommendation.created": Info,
  "donation.completed": HeartHandshake,
  "report.generated": FileText,
  "assignment.received": UserCheck,
  "validation.warning": AlertTriangle,
};

export const SEVERITY_LABELS: Record<NotificationSeverity, string> = {
  critical: "Critical",
  warning: "Warning",
  informational: "Info",
};

export function formatNotificationTime(iso: string): string {
  const date = new Date(iso);
  const now = Date.now();
  const diff = now - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}

export function getNotificationIcon(
  type: HarvestNotification["type"],
): LucideIcon {
  return NOTIFICATION_TYPE_ICONS[type] ?? Bell;
}
