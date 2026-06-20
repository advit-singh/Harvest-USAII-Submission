"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAssistantStore } from "@/store/assistant-store";

export function useAssistantFilters(orgId: string | null) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("conversation");

  const pendingConversationId = useAssistantStore((s) => s.pendingConversationId);
  const setPendingConversationId = useAssistantStore(
    (s) => s.setPendingConversationId,
  );

  const activeConversationId =
    conversationId ?? pendingConversationId ?? null;

  const selectConversation = useCallback(
    (id: string | null) => {
      if (!orgId) return;
      setPendingConversationId(id);
      const params = new URLSearchParams(searchParams.toString());
      if (id) {
        params.set("conversation", id);
      } else {
        params.delete("conversation");
      }
      const qs = params.toString();
      router.replace(qs ? `/assistant?${qs}` : "/assistant", {
        scroll: false,
      });
    },
    [orgId, router, searchParams, setPendingConversationId],
  );

  return {
    activeConversationId,
    selectConversation,
  };
}
