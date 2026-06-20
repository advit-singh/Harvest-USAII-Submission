"use client";

import { LayoutTemplate } from "lucide-react";
import { ReportsQueryState } from "@/features/reports/components/ReportsQueryState";
import { ReportTemplateCard } from "@/features/reports/components/templates/ReportTemplateCard";
import { useReportTemplates } from "@/features/reports/hooks/useReportTemplates";
import type { ReportTemplateId } from "@/types/report";

interface TemplatesTabProps {
  orgId: string;
  canGenerate: boolean;
  onOpenBuilder: (template: ReportTemplateId) => void;
}

export function TemplatesTab({
  orgId,
  canGenerate,
  onOpenBuilder,
}: TemplatesTabProps) {
  const query = useReportTemplates(orgId);

  return (
    <ReportsQueryState
      query={query}
      emptyIcon={LayoutTemplate}
      emptyTitle="No templates available"
      emptyDescription="Report templates will appear when configured for your organization."
      isEmpty={(data) => data.length === 0}
    >
      {(templates) => (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {templates.map((template) => (
            <ReportTemplateCard
              key={template.id}
              template={template}
              canGenerate={canGenerate}
              onGenerate={() => onOpenBuilder(template.id)}
            />
          ))}
        </div>
      )}
    </ReportsQueryState>
  );
}
