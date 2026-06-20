"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AssistantCitation } from "@/types/assistant";

interface CitationCardProps {
  citation: AssistantCitation;
  selected?: boolean;
  onSelect?: () => void;
}

const SOURCE_LABELS: Record<AssistantCitation["sourceType"], string> = {
  forecast: "Forecast",
  waste: "Waste",
  inventory: "Inventory",
  recommendation: "Recommendation",
  upload: "Upload",
  report: "Report",
  attendance: "Attendance",
  donation: "Donation",
};

export function CitationCard({
  citation,
  selected = false,
  onSelect,
}: CitationCardProps) {
  return (
    <article
      className={cn(
        "rounded-lg border p-3 transition-colors",
        selected
          ? "border-[var(--color-ai-accent)] bg-[var(--color-ai-bg)]"
          : "border-border bg-background hover:bg-muted/50",
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="mb-1 flex items-center gap-2">
          <Badge variant="ai" className="text-[10px]">
            {SOURCE_LABELS[citation.sourceType]}
          </Badge>
          {citation.confidence !== undefined && (
            <span className="text-[10px] text-muted-foreground">
              {Math.round(citation.confidence * 100)}% confidence
            </span>
          )}
        </div>
        <h4 className="text-sm font-medium">{citation.title}</h4>
        <p className="mt-1 text-xs text-muted-foreground">{citation.excerpt}</p>
      </button>
      {citation.href && (
        <Link
          href={citation.href}
          className="mt-2 inline-flex items-center gap-1 text-xs text-[var(--color-ai-accent)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          View source
          <ExternalLink className="h-3 w-3" aria-hidden />
        </Link>
      )}
    </article>
  );
}
