"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { sendMessage } from "@/lib/api/assistant";
import { assistantKeys } from "@/features/assistant/config/assistant-keys";
import type { AssistantConversationDetail } from "@/types/assistant";

export function useAssistantChat(orgId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendMessage,
    onMutate: async (input) => {
      if (!orgId) return;

      const key = assistantKeys.conversation(orgId, input.conversationId);
      await queryClient.cancelQueries({ queryKey: key });

      const previous = queryClient.getQueryData<AssistantConversationDetail>(key);

      if (previous) {
        const optimistic: AssistantConversationDetail = {
          ...previous,
          messages: [
            ...previous.messages,
            {
              id: `optimistic_${Date.now()}`,
              role: "user",
              content: input.message,
              createdAt: new Date().toISOString(),
            },
          ],
          updatedAt: new Date().toISOString(),
        };
        queryClient.setQueryData(key, optimistic);
      }

      return { previous, key };
    },
    onError: (_err, _input, context) => {
      if (context?.previous && context.key) {
        queryClient.setQueryData(context.key, context.previous);
      }
      toast.error("Message failed to send", { description: "Please try again." });
    },
    onSuccess: (_data, input) => {
      if (!orgId) return;
      queryClient.invalidateQueries({
        queryKey: assistantKeys.conversation(orgId, input.conversationId),
      });
      queryClient.invalidateQueries({
        queryKey: assistantKeys.conversations(orgId),
      });
    },
  });
}
