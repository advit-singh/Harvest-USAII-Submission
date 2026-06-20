"use client";

import Link from "next/link";
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
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  formatNotificationTime,
  SEVERITY_LABELS,
} from "@/features/notifications/config/notification-categories";
import type { HarvestNotification, NotificationType } from "@/types/notification";

interface NotificationItemProps {
  notification: HarvestNotification;
  onRead: (id: string) => void;
}

function NotificationTypeIcon({ type }: { type: NotificationType }) {
  const className = "h-4 w-4";
  switch (type) {
    case "upload.completed":
      return <Upload className={className} aria-hidden />;
    case "forecast.generated":
      return <Bot className={className} aria-hidden />;
    case "recommendation.created":
      return <Info className={className} aria-hidden />;
    case "donation.completed":
      return <HeartHandshake className={className} aria-hidden />;
    case "report.generated":
      return <FileText className={className} aria-hidden />;
    case "assignment.received":
      return <UserCheck className={className} aria-hidden />;
    case "validation.warning":
      return <AlertTriangle className={className} aria-hidden />;
    default:
      return <Bell className={className} aria-hidden />;
  }
}

export function NotificationItem({
  notification,
  onRead,
}: NotificationItemProps) {
  const content = (
    <>
      <div
        className={cn(
          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          notification.severity === "critical"
            ? "bg-destructive/10 text-destructive"
            : notification.severity === "warning"
              ? "bg-warning/10 text-warning"
              : "bg-muted text-muted-foreground",
        )}
      >
        <NotificationTypeIcon type={notification.type} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p
            className={cn(
              "truncate text-sm",
              !notification.isRead && "font-semibold",
            )}
          >
            {notification.title}
          </p>
          {!notification.isRead && (
            <span
              className="h-2 w-2 shrink-0 rounded-full bg-primary"
              aria-hidden
            />
          )}
        </div>
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {notification.message}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <Badge variant="outline" className="text-[10px]">
            {SEVERITY_LABELS[notification.severity]}
          </Badge>
          <span className="text-[10px] text-muted-foreground">
            {formatNotificationTime(notification.createdAt)}
          </span>
        </div>
      </div>
    </>
  );

  const className = cn(
    "flex w-full gap-3 rounded-md p-3 text-left transition-colors hover:bg-muted/50",
    !notification.isRead && "bg-primary/5",
  );

  if (notification.href) {
    return (
      <Link
        href={notification.href}
        className={className}
        onClick={() => {
          if (!notification.isRead) onRead(notification.id);
        }}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        if (!notification.isRead) onRead(notification.id);
      }}
    >
      {content}
    </button>
  );
}
