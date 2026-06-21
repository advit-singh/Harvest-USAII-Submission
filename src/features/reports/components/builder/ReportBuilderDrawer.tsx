"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Input } from "@/components/ui/input";
import { useGenerateReport } from "@/features/reports/hooks/useGenerateReport";
import { useReportTemplates } from "@/features/reports/hooks/useReportTemplates";
import { useOrgSites } from "@/features/organizations/hooks/useOrgSites";
import {
  DATE_RANGE_OPTIONS,
  FORMAT_OPTIONS,
} from "@/features/reports/config/report-tabs";
import {
  defaultGenerateInput,
  reportGenerateSchema,
  toReportDateRange,
  type ReportGenerateInput,
} from "@/features/reports/schemas/report-generate.schema";
import type { ReportTemplateId } from "@/types/report";

interface ReportBuilderDrawerProps {
  orgId: string;
  open: boolean;
  initialTemplate: ReportTemplateId | null;
  onOpenChange: (open: boolean) => void;
  onGenerated: (reportId: string) => void;
}

export function ReportBuilderDrawer({
  orgId,
  open,
  initialTemplate,
  onOpenChange,
  onGenerated,
}: ReportBuilderDrawerProps) {
  const templatesQuery = useReportTemplates(orgId);
  const generate = useGenerateReport(orgId);
  const { siteOptions, defaultSiteId } = useOrgSites(orgId);

  const form = useForm<ReportGenerateInput>({
    resolver: zodResolver(reportGenerateSchema),
    defaultValues: defaultGenerateInput(
      initialTemplate ?? "monthly_summary",
      "pdf",
      defaultSiteId,
    ),
  });

  const watchPreset = form.watch("dateRangePreset");
  const watchTemplate = form.watch("template");

  useEffect(() => {
    if (defaultSiteId && !form.getValues("siteId")) {
      form.setValue("siteId", defaultSiteId);
    }
  }, [defaultSiteId, form]);

  useEffect(() => {
    if (open && initialTemplate) {
      const template = templatesQuery.data?.find((t) => t.id === initialTemplate);
      form.reset(
        defaultGenerateInput(
          initialTemplate,
          template?.defaultFormat ?? "pdf",
          defaultSiteId,
        ),
      );
    }
  }, [open, initialTemplate, templatesQuery.data, form, defaultSiteId]);

  const selectedTemplate = templatesQuery.data?.find(
    (t) => t.id === watchTemplate,
  );
  const formatOptions = selectedTemplate
    ? FORMAT_OPTIONS.filter((f) =>
        selectedTemplate.supportedFormats.includes(f.value),
      )
    : FORMAT_OPTIONS;

  const onSubmit = form.handleSubmit((values) => {
    generate.mutate(
      {
        organizationId: orgId,
        template: values.template,
        siteId: values.siteId,
        format: values.format,
        dateRange: toReportDateRange(values),
      },
      {
        onSuccess: (data) => {
          onGenerated(data.id);
          onOpenChange(false);
        },
      },
    );
  });

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>Generate report</DrawerTitle>
          <p className="text-sm text-muted-foreground">
            Configure template, site, date range, and export format.
          </p>
        </DrawerHeader>

        <form
          onSubmit={onSubmit}
          className="space-y-4 overflow-y-auto px-4 pb-6"
        >
          <div className="space-y-1">
            <Label htmlFor="builder-template">Template</Label>
            <Select
              value={watchTemplate}
              onValueChange={(value) =>
                form.setValue("template", value as ReportTemplateId)
              }
            >
              <SelectTrigger id="builder-template">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(templatesQuery.data ?? []).map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="builder-site">Site</Label>
            <Select
              value={form.watch("siteId")}
              onValueChange={(value) => form.setValue("siteId", value)}
            >
              <SelectTrigger id="builder-site">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {siteOptions.filter((s) => s.value !== "all").map((site) => (
                  <SelectItem key={site.value} value={site.value}>
                    {site.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="builder-range">Date range</Label>
            <Select
              value={watchPreset}
              onValueChange={(value) =>
                form.setValue(
                  "dateRangePreset",
                  value as ReportGenerateInput["dateRangePreset"],
                )
              }
            >
              <SelectTrigger id="builder-range">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DATE_RANGE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {watchPreset === "custom" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="builder-start">Start date</Label>
                <Input
                  id="builder-start"
                  type="date"
                  {...form.register("dateStart")}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="builder-end">End date</Label>
                <Input
                  id="builder-end"
                  type="date"
                  {...form.register("dateEnd")}
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="builder-format">Format</Label>
            <Select
              value={form.watch("format")}
              onValueChange={(value) =>
                form.setValue("format", value as ReportGenerateInput["format"])
              }
            >
              <SelectTrigger id="builder-format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {formatOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={generate.isPending}>
              {generate.isPending ? "Generating…" : "Generate report"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
