"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createRecipient } from "@/lib/api/recipients";
import { recipientKeys } from "@/features/rescue/hooks/rescue-keys";
import type { CreateRecipientPayload } from "@/types/recipient";

export function useCreateRecipient(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRecipientPayload) =>
      createRecipient(orgId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: recipientKeys.list(orgId),
      });
    },
  });
}
