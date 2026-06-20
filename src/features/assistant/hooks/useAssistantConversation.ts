"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchConversation } from "@/lib/api/assistant";
import { assistantKeys } from "@/features/assistant/config/assistant-keys";

export function useAssistantConversation(
  orgId: string | null,
  conversationId: string | null,
) {
  return useQuery({
    queryKey:
      orgId && conversationId
        ? assistantKeys.conversation(orgId, conversationId)
        : assistantKeys.all,
    queryFn: () => fetchConversation(conversationId!),
    enabled: Boolean(orgId && conversationId),
    staleTime: 10_000,
  });
}
