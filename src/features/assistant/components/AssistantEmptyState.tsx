"use client";

import { Bot } from "lucide-react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { SuggestedPrompts } from "@/features/assistant/components/SuggestedPrompts";

interface AssistantEmptyStateProps {
  onPromptSelect: (message: string) => void;
  disabled?: boolean;
}

export function AssistantEmptyState({
  onPromptSelect,
  disabled = false,
}: AssistantEmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6">
      <EmptyState
        icon={Bot}
        title="Ask about your operations"
        description="Get explainable answers about waste trends, forecasts, inventory priorities, and donation opportunities — with cited evidence."
      />
      <div className="mt-6 w-full max-w-lg">
        <SuggestedPrompts onSelect={onPromptSelect} disabled={disabled} />
      </div>
    </div>
  );
}
