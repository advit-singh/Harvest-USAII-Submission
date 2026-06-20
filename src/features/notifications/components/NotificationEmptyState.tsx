"use client";

import { Bell } from "lucide-react";
import { EmptyState } from "@/components/feedback/EmptyState";

export function NotificationEmptyState() {
  return (
    <EmptyState
      icon={Bell}
      title="No notifications"
      description="You're all caught up. Alerts for uploads, forecasts, and donations appear here."
      className="py-8"
    />
  );
}
