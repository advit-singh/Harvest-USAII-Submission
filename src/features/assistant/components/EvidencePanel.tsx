"use client";

import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CitationCard } from "@/features/assistant/components/CitationCard";
import { useAssistantStore } from "@/store/assistant-store";
import type { AssistantCitation } from "@/types/assistant";

interface EvidencePanelProps {
  citations: AssistantCitation[];
  className?: string;
}

export function EvidencePanel({ citations, className }: EvidencePanelProps) {
  const evidencePanelOpen = useAssistantStore((s) => s.evidencePanelOpen);
  const selectedCitationId = useAssistantStore((s) => s.selectedCitationId);
  const setSelectedCitationId = useAssistantStore((s) => s.setSelectedCitationId);
  const toggleEvidencePanel = useAssistantStore((s) => s.toggleEvidencePanel);

  if (!evidencePanelOpen) {
    return (
      <div className={className}>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleEvidencePanel}
          aria-label="Show evidence panel"
          className="w-full"
        >
          <PanelRightOpen className="mr-2 h-4 w-4" />
          Show evidence ({citations.length})
        </Button>
      </div>
    );
  }

  return (
    <aside
      className={className}
      aria-label="Evidence panel"
    >
      <div className="flex h-full flex-col rounded-lg border bg-background">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-sm font-semibold">Evidence</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleEvidencePanel}
            aria-label="Hide evidence panel"
          >
            <PanelRightClose className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          {citations.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Citations from assistant responses will appear here.
            </p>
          ) : (
            <ul className="space-y-2">
              {citations.map((citation) => (
                <li key={citation.id}>
                  <CitationCard
                    citation={citation}
                    selected={selectedCitationId === citation.id}
                    onSelect={() => setSelectedCitationId(citation.id)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </aside>
  );
}
