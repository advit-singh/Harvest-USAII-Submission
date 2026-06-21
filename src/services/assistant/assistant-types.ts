import type { AssistantCitation, CitationSourceType } from "@/types/assistant";

export interface RetrievalScope {
  organizationId: string;
  siteId?: string;
}

export interface RetrievalBundle {
  wasteSummary: string;
  inventorySummary: string;
  attendanceSummary: string;
  forecastSummary: string;
  recommendationSummary: string;
  donationSummary: string;
  impactSummary: string;
  citations: AssistantCitation[];
}

export interface AssembledContext {
  promptContext: string;
  citations: AssistantCitation[];
}

export interface MessageMetadata {
  reasoning: string;
  confidence: number;
  recommendedActions?: Array<{
    id: string;
    label: string;
    description?: string;
    href: string;
  }>;
}

export function citationHref(sourceType: CitationSourceType, recordId?: string): string {
  switch (sourceType) {
    case "forecast":
      return recordId ? `/predictions?tab=explorer&forecastId=${recordId}` : "/predictions?tab=explorer";
    case "recommendation":
      return recordId
        ? `/predictions?tab=recommendations&recommendationId=${recordId}`
        : "/predictions?tab=recommendations";
    case "waste":
      return "/analytics?tab=waste";
    case "inventory":
      return "/analytics?tab=inventory";
    case "attendance":
      return "/analytics?tab=attendance";
    case "donation":
      return "/rescue?tab=opportunities";
    case "report":
      return "/reports?tab=generated";
    case "upload":
      return "/uploads?tab=history";
    default:
      return "/dashboard";
  }
}
