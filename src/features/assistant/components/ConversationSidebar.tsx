"use client";

import { MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConversationListItem } from "@/features/assistant/components/ConversationListItem";
import type { AssistantConversation } from "@/types/assistant";

interface ConversationSidebarProps {
  conversations: AssistantConversation[];
  activeConversationId: string | null;
  isLoading?: boolean;
  onSelect: (id: string) => void;
  onNewConversation: () => void;
  isCreating?: boolean;
}

export function ConversationSidebar({
  conversations,
  activeConversationId,
  isLoading = false,
  onSelect,
  onNewConversation,
  isCreating = false,
}: ConversationSidebarProps) {
  return (
    <nav
      className="flex h-full flex-col rounded-lg border bg-background"
      aria-label="Conversation history"
    >
      <div className="border-b p-3">
        <Button
          className="w-full"
          variant="outline"
          onClick={onNewConversation}
          disabled={isCreating}
        >
          <MessageSquarePlus className="mr-2 h-4 w-4" />
          New conversation
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="space-y-2 p-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : conversations.length === 0 ? (
          <p className="p-3 text-sm text-muted-foreground">
            No conversations yet. Start by asking a question.
          </p>
        ) : (
          <ul className="space-y-1">
            {conversations.map((conv) => (
              <li key={conv.id}>
                <ConversationListItem
                  conversation={conv}
                  selected={conv.id === activeConversationId}
                  onSelect={() => onSelect(conv.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </nav>
  );
}
