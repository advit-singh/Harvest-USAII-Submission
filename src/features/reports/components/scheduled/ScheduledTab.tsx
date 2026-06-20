"use client";

import { CalendarClock } from "lucide-react";
import { EmptyState } from "@/components/feedback/EmptyState";

export function ScheduledTab() {
  return (
    <EmptyState
      icon={CalendarClock}
      title="Scheduled reports coming soon"
      description="Automated report scheduling will be available when the reporting service adds schedule APIs. For now, generate reports on demand from the Templates tab."
    />
  );
}
