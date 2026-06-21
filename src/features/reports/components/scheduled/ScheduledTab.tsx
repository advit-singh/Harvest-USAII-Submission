"use client";

import { useState } from "react";
import { ScheduledReportsList } from "@/features/reports/components/scheduled/ScheduledReportsList";
import { ScheduleReportDrawer } from "@/features/reports/components/scheduled/ScheduleReportDrawer";
import type { ReportSchedule } from "@/types/report";

interface ScheduledTabProps {
  orgId: string;
}

export function ScheduledTab({ orgId }: ScheduledTabProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<ReportSchedule | null>(null);

  const openCreate = () => {
    setEditing(null);
    setDrawerOpen(true);
  };

  const openEdit = (schedule: ReportSchedule) => {
    setEditing(schedule);
    setDrawerOpen(true);
  };

  return (
    <>
      <ScheduledReportsList orgId={orgId} onEdit={openEdit} onCreate={openCreate} />
      <ScheduleReportDrawer
        orgId={orgId}
        open={drawerOpen}
        schedule={editing}
        onOpenChange={setDrawerOpen}
      />
    </>
  );
}
