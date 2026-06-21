"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrgSites } from "@/features/organizations/hooks/useOrgSites";
import { useReportTemplates } from "@/features/reports/hooks/useReportTemplates";
import {
  useCreateReportSchedule,
  useUpdateReportSchedule,
} from "@/features/reports/hooks/useReportSchedules";
import { FORMAT_OPTIONS } from "@/features/reports/config/report-tabs";
import type { ReportSchedule, ReportTemplateId } from "@/types/report";

const scheduleSchema = z.object({
  template: z.string().min(1),
  siteId: z.string().min(1),
  format: z.enum(["pdf", "docx", "csv"]),
  cadence: z.enum(["daily", "weekly", "monthly"]),
  dayOfWeek: z.string().optional(),
  dayOfMonth: z.string().optional(),
  timezone: z.string().min(1),
});

type ScheduleFormInput = z.infer<typeof scheduleSchema>;

interface ScheduleReportDrawerProps {
  orgId: string;
  open: boolean;
  schedule: ReportSchedule | null;
  onOpenChange: (open: boolean) => void;
}

export function ScheduleReportDrawer({
  orgId,
  open,
  schedule,
  onOpenChange,
}: ScheduleReportDrawerProps) {
  const templatesQuery = useReportTemplates(orgId);
  const { siteOptions, defaultSiteId } = useOrgSites(orgId);
  const createMutation = useCreateReportSchedule(orgId);
  const updateMutation = useUpdateReportSchedule(orgId);

  const form = useForm<ScheduleFormInput>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      template: "monthly_summary",
      siteId: defaultSiteId,
      format: "pdf",
      cadence: "weekly",
      dayOfWeek: "1",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    },
  });

  useEffect(() => {
    if (!open) return;
    if (schedule) {
      form.reset({
        template: schedule.template,
        siteId: schedule.siteId,
        format: schedule.format,
        cadence: schedule.cadence,
        dayOfWeek: String(schedule.dayOfWeek ?? 1),
        dayOfMonth: String(schedule.dayOfMonth ?? 1),
        timezone: schedule.timezone,
      });
    } else {
      form.reset({
        template: "monthly_summary",
        siteId: defaultSiteId,
        format: "pdf",
        cadence: "weekly",
        dayOfWeek: "1",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      });
    }
  }, [open, schedule, form, defaultSiteId]);

  const onSubmit = form.handleSubmit((values) => {
    const payload = {
      organizationId: orgId,
      siteId: values.siteId,
      template: values.template as ReportTemplateId,
      format: values.format,
      cadence: values.cadence,
      dayOfWeek: values.cadence === "weekly" ? Number(values.dayOfWeek ?? 1) : null,
      dayOfMonth: values.cadence === "monthly" ? Number(values.dayOfMonth ?? 1) : null,
      timezone: values.timezone,
    };

    if (schedule) {
      updateMutation.mutate(
        {
          id: schedule.id,
          patch: {
            siteId: payload.siteId,
            template: payload.template,
            format: payload.format,
            cadence: payload.cadence,
            dayOfWeek: payload.dayOfWeek,
            dayOfMonth: payload.dayOfMonth,
            timezone: payload.timezone,
          },
        },
        {
          onSuccess: () => {
            toast.success("Schedule updated");
            onOpenChange(false);
          },
          onError: () => toast.error("Failed to update schedule"),
        },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Schedule created");
          onOpenChange(false);
        },
        onError: () => toast.error("Failed to create schedule"),
      });
    }
  });

  const cadence = form.watch("cadence");

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>{schedule ? "Edit schedule" : "New schedule"}</DrawerTitle>
        </DrawerHeader>
        <form onSubmit={onSubmit} className="space-y-4 overflow-y-auto px-4 pb-6">
          <div className="space-y-1">
            <Label>Template</Label>
            <Select
              value={form.watch("template")}
              onValueChange={(v) => form.setValue("template", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(templatesQuery.data ?? []).map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Site</Label>
            <Select
              value={form.watch("siteId")}
              onValueChange={(v) => form.setValue("siteId", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {siteOptions
                  .filter((s) => s.value !== "all")
                  .map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Format</Label>
            <Select
              value={form.watch("format")}
              onValueChange={(v) =>
                form.setValue("format", v as ScheduleFormInput["format"])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FORMAT_OPTIONS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Cadence</Label>
            <Select
              value={cadence}
              onValueChange={(v) =>
                form.setValue("cadence", v as ScheduleFormInput["cadence"])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {cadence === "weekly" && (
            <div className="space-y-1">
              <Label>Day of week</Label>
              <Select
                value={form.watch("dayOfWeek")}
                onValueChange={(v) => form.setValue("dayOfWeek", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Sunday",
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                  ].map((day, i) => (
                    <SelectItem key={day} value={String(i)}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {cadence === "monthly" && (
            <div className="space-y-1">
              <Label>Day of month</Label>
              <Select
                value={form.watch("dayOfMonth")}
                onValueChange={(v) => form.setValue("dayOfMonth", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                    <SelectItem key={d} value={String(d)}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {schedule ? "Save changes" : "Create schedule"}
          </Button>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
