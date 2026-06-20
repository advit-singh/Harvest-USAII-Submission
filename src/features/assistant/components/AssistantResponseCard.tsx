"use client";

import { AiBadge } from "@/components/ai/AiBadge";
import { ConfidenceIndicator } from "@/components/ai/ConfidenceIndicator";
import { ReasoningPanel } from "@/features/assistant/components/ReasoningPanel";
import { RecommendedActions } from "@/features/assistant/components/RecommendedActions";
import type { AssistantChatResponse } from "@/types/assistant";

interface AssistantResponseCardProps {
  response: AssistantChatResponse;
  onCitationSelect?: (citationId: string) => void;
}

export function AssistantResponseCard({
  response,
  onCitationSelect,
}: AssistantResponseCardProps) {
  const confidencePercent = Math.round(response.confidence * 100);

  return (
    <article
      className="rounded-lg border border-[var(--color-ai-border)] bg-[var(--color-ai-bg)] p-4"
      aria-label="Assistant response"
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <AiBadge label="Intelligence" />
        <ConfidenceIndicator value={confidencePercent} />
      </div>
      <p className="text-sm leading-relaxed text-foreground">{response.answer}</p>
      <ReasoningPanel reasoning={response.reasoning} />
      {response.citations.length > 0 && (
        <div className="mt-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Evidence ({response.citations.length})
          </p>
          <ul className="flex flex-wrap gap-2">
            {response.citations.map((citation) => (
              <li key={citation.id}>
                <button
                  type="button"
                  onClick={() => onCitationSelect?.(citation.id)}
                  className="rounded-full border border-[var(--color-ai-border)] bg-background px-2.5 py-1 text-xs text-[var(--color-ai-accent)] hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {citation.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {response.recommendedActions && response.recommendedActions.length > 0 && (
        <RecommendedActions actions={response.recommendedActions} />
      )}
    </article>
  );
}
