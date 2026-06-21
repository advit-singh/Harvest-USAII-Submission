"use client";

import { CalendarClock, Pause, Play, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useDeleteReportSchedule,
  useReportSchedules,
  useUpdateReportSchedule,
} from "@/features/reports/hooks/useReportSchedules";
import { ReportsQueryState } from "@/features/reports/components/ReportsQueryState";
import type { ReportSchedule } from "@/types/report";

interface ScheduledReportsListProps {
  orgId: string;
  onEdit: (schedule: ReportSchedule) => void;
  onCreate: () => void;
}

export function ScheduledReportsList({
  orgId,
  onEdit,
  onCreate,
}: ScheduledReportsListProps) {
  const query = useReportSchedules(orgId);
  const updateMutation = useUpdateReportSchedule(orgId);
  const deleteMutation = useDeleteReportSchedule(orgId);

  const toggleActive = (schedule: ReportSchedule) => {
    updateMutation.mutate(
      { id: schedule.id, patch: { isActive: !schedule.isActive } },
      {
        onSuccess: () =>
          toast.success(schedule.isActive ? "Schedule paused" : "Schedule resumed"),
        onError: () => toast.error("Failed to update schedule"),
      },
    );
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success("Schedule deleted"),
      onError: () => toast.error("Failed to delete schedule"),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Automate report generation on a daily, weekly, or monthly cadence.
        </p>
        <Button onClick={onCreate}>New schedule</Button>
      </div>

      <ReportsQueryState
        query={query}
        emptyIcon={CalendarClock}
        emptyTitle="No scheduled reports"
        emptyDescription="Create a schedule to automatically generate reports."
        isEmpty={(data) => data.length === 0}
      >
        {(schedules) => (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Cadence</TableHead>
                  <TableHead>Next run</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell className="font-medium">
                      {schedule.templateName}
                    </TableCell>
                    <TableCell>{schedule.siteName}</TableCell>
                    <TableCell className="capitalize">{schedule.cadence}</TableCell>
                    <TableCell>
                      {schedule.nextRunAt
                        ? new Date(schedule.nextRunAt).toLocaleString()
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={schedule.isActive ? "default" : "secondary"}>
                        {schedule.isActive ? "Active" : "Paused"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={schedule.isActive ? "Pause schedule" : "Resume schedule"}
                          onClick={() => toggleActive(schedule)}
                        >
                          {schedule.isActive ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Edit schedule"
                          onClick={() => onEdit(schedule)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Delete schedule"
                          onClick={() => handleDelete(schedule.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </ReportsQueryState>
    </div>
  );
}
