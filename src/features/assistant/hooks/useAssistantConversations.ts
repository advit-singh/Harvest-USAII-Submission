"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createConversation,
  fetchConversations,
} from "@/lib/api/assistant";
import { assistantKeys } from "@/features/assistant/config/assistant-keys";

export function useAssistantConversations(orgId: string | null) {
  return useQuery({
    queryKey: orgId ? assistantKeys.conversations(orgId) : assistantKeys.all,
    queryFn: () => fetchConversations(orgId!),
    enabled: Boolean(orgId),
    staleTime: 30_000,
  });
}

export function useCreateConversation(orgId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => createConversation(orgId!),
    onSuccess: (data) => {
      if (orgId) {
        queryClient.invalidateQueries({
          queryKey: assistantKeys.conversations(orgId),
        });
        queryClient.setQueryData(
          assistantKeys.conversation(orgId, data.id),
          data,
        );
      }
    },
  });
}
