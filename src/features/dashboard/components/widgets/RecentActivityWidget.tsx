"use client";

import Link from "next/link";
import { Activity } from "lucide-react";
import { WidgetShell } from "@/features/dashboard/components/WidgetShell";
import { WidgetQueryState } from "@/features/dashboard/components/WidgetQueryState";
import { useRecentActivity } from "@/features/dashboard/hooks/useRecentActivity";
import type { NotificationType } from "@/types/notification";
import { cn } from "@/lib/utils";

const TYPE_LABEL: Record<NotificationType, string> = {
  "upload.completed": "Upload",
  "forecast.generated": "Forecast",
  "recommendation.created": "Recommendation",
  "donation.completed": "Donation",
  "report.generated": "Report",
  "assignment.received": "Assignment",
  "validation.warning": "Validation",
};

interface RecentActivityWidgetProps {
  orgId: string;
}

export function RecentActivityWidget({ orgId }: RecentActivityWidgetProps) {
  const query = useRecentActivity(orgId, 8);

  return (
    <WidgetShell widgetId="recent-activity">
      <WidgetQueryState
        query={query}
        emptyIcon={Activity}
        emptyTitle="No recent activity"
        emptyDescription="Activity from uploads, forecasts, and actions appears here."
        isEmpty={(data) => data.length === 0}
      >
        {(notifications) => (
          <ul className="space-y-2" role="list">
            {notifications.map((item) => (
              <li key={item.id}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className="flex items-start gap-3 rounded-md p-2 transition-colors hover:bg-muted/50"
                  >
                    <ActivityItemContent item={item} />
                  </Link>
                ) : (
                  <div className="flex items-start gap-3 rounded-md p-2">
                    <ActivityItemContent item={item} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </WidgetQueryState>
    </WidgetShell>
  );
}

function ActivityItemContent({
  item,
}: {
  item: {
    type: NotificationType;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
  };
}) {
  return (
    <>
      <div
        className={cn(
          "mt-1.5 h-2 w-2 shrink-0 rounded-full",
          item.isRead ? "bg-muted" : "bg-primary",
        )}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-primary">
            {TYPE_LABEL[item.type]}
          </span>
          <time
            className="text-xs text-muted-foreground"
            dateTime={item.createdAt}
          >
            {formatRelativeTime(item.createdAt)}
          </time>
        </div>
        <p className="text-sm font-medium">{item.title}</p>
        <p className="text-xs text-muted-foreground line-clamp-1">
          {item.message}
        </p>
      </div>
    </>
  );
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
