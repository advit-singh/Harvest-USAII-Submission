"use client";

import { cn } from "@/lib/utils";
import type { AssistantConversation } from "@/types/assistant";

interface ConversationListItemProps {
  conversation: AssistantConversation;
  selected: boolean;
  onSelect: () => void;
}

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function ConversationListItem({
  conversation,
  selected,
  onSelect,
}: ConversationListItemProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-md px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected ? "bg-accent" : "hover:bg-muted/60",
      )}
      aria-current={selected ? "true" : undefined}
    >
      <p className="truncate text-sm font-medium">{conversation.title}</p>
      <p className="mt-0.5 truncate text-xs text-muted-foreground">
        {conversation.preview}
      </p>
      <p className="mt-1 text-[10px] text-muted-foreground">
        {formatRelativeTime(conversation.updatedAt)}
      </p>
    </button>
  );
}
