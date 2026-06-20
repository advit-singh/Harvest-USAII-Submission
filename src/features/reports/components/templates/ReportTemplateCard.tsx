"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ReportTemplate } from "@/types/report";

interface ReportTemplateCardProps {
  template: ReportTemplate;
  canGenerate: boolean;
  onGenerate: () => void;
}

export function ReportTemplateCard({
  template,
  canGenerate,
  onGenerate,
}: ReportTemplateCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{template.name}</CardTitle>
          <Badge variant="outline">{template.defaultFormat.toUpperCase()}</Badge>
        </div>
        <CardDescription>{template.description}</CardDescription>
      </CardHeader>
      <CardContent className="mt-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {template.supportedFormats.map((format) => (
            <Badge key={format} variant="secondary" className="text-[10px]">
              {format.toUpperCase()}
            </Badge>
          ))}
        </div>
        <Button
          size="sm"
          onClick={onGenerate}
          disabled={!canGenerate}
          aria-label={`Generate ${template.name}`}
        >
          Generate
        </Button>
      </CardContent>
    </Card>
  );
}
