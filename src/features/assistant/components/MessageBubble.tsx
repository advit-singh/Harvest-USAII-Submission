"use client";

import { cn } from "@/lib/utils";
import type { AssistantMessage } from "@/types/assistant";
import { AssistantResponseCard } from "@/features/assistant/components/AssistantResponseCard";
import { Skeleton } from "@/components/ui/skeleton";

interface MessageBubbleProps {
  message: AssistantMessage;
  isPending?: boolean;
  onCitationSelect?: (citationId: string) => void;
}

export function MessageBubble({
  message,
  isPending = false,
  onCitationSelect,
}: MessageBubbleProps) {
  const isUser = message.role === "user";

  if (isPending) {
    return (
      <div className="flex justify-start" aria-live="polite" aria-busy="true">
        <div className="max-w-[85%] space-y-2 rounded-lg border border-[var(--color-ai-border)] bg-[var(--color-ai-bg)] p-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-3/5" />
          <span className="sr-only">Assistant is responding</span>
        </div>
      </div>
    );
  }

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div
          className={cn(
            "max-w-[85%] rounded-lg bg-primary px-4 py-3 text-sm text-primary-foreground",
          )}
        >
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start" aria-live="polite">
      <div className="max-w-full flex-1">
        {message.response ? (
          <AssistantResponseCard
            response={message.response}
            onCitationSelect={onCitationSelect}
          />
        ) : (
          <div className="rounded-lg border border-[var(--color-ai-border)] bg-[var(--color-ai-bg)] px-4 py-3 text-sm">
            {message.content}
          </div>
        )}
      </div>
    </div>
  );
}
