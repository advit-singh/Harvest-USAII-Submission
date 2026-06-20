"use client";

import { useEffect, useRef } from "react";
import { ChatComposer } from "@/features/assistant/components/ChatComposer";
import { MessageBubble } from "@/features/assistant/components/MessageBubble";
import { AssistantEmptyState } from "@/features/assistant/components/AssistantEmptyState";
import { SuggestedPrompts } from "@/features/assistant/components/SuggestedPrompts";
import { useAssistantStore } from "@/store/assistant-store";
import type { AssistantConversationDetail } from "@/types/assistant";

interface ChatPanelProps {
  conversation: AssistantConversationDetail | null;
  isSending: boolean;
  onSend: (message: string) => void;
}

export function ChatPanel({
  conversation,
  isSending,
  onSend,
}: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const setSelectedCitationId = useAssistantStore((s) => s.setSelectedCitationId);
  const setEvidencePanelOpen = useAssistantStore((s) => s.setEvidencePanelOpen);

  const messages = conversation?.messages ?? [];
  const hasMessages = messages.length > 0;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, isSending]);

  const handleCitationSelect = (citationId: string) => {
    setSelectedCitationId(citationId);
    setEvidencePanelOpen(true);
  };

  const handleSend = (message: string) => {
    onSend(message);
  };

  return (
    <div className="flex h-full flex-col rounded-lg border bg-background">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
        {!hasMessages && !isSending ? (
          <AssistantEmptyState
            onPromptSelect={handleSend}
            disabled={isSending}
          />
        ) : (
          <div className="mx-auto max-w-3xl space-y-4">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                onCitationSelect={handleCitationSelect}
              />
            ))}
            {isSending && <MessageBubble message={{ id: "pending", role: "assistant", content: "", createdAt: "" }} isPending />}
            {!isSending && hasMessages && (
              <SuggestedPrompts onSelect={handleSend} disabled={isSending} />
            )}
          </div>
        )}
      </div>
      <ChatComposer onSend={handleSend} disabled={isSending} />
    </div>
  );
}
