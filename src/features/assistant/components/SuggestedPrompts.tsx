"use client";

import { SUGGESTED_PROMPTS } from "@/features/assistant/config/suggested-prompts";

interface SuggestedPromptsProps {
  onSelect: (message: string) => void;
  disabled?: boolean;
}

export function SuggestedPrompts({ onSelect, disabled = false }: SuggestedPromptsProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-muted-foreground">
        Suggested questions
      </p>
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_PROMPTS.map((prompt) => (
          <button
            key={prompt.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(prompt.message)}
            className="rounded-full border border-[var(--color-ai-border)] bg-[var(--color-ai-bg)] px-3 py-1.5 text-xs text-[var(--color-ai-accent)] hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            {prompt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
