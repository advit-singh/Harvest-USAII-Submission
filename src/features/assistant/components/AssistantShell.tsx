"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { History, MessageSquare, PanelRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchDashboardOverview } from "@/lib/api/analytics";
import { EmptyOrgDashboard } from "@/features/organizations/components/EmptyOrgDashboard";
import { PageLoadingState } from "@/components/feedback/LoadingState";
import { AssistantQueryState } from "@/features/assistant/components/AssistantQueryState";
import { ConversationSidebar } from "@/features/assistant/components/ConversationSidebar";
import { ChatPanel } from "@/features/assistant/components/ChatPanel";
import { EvidencePanel } from "@/features/assistant/components/EvidencePanel";
import { useAssistantFilters } from "@/features/assistant/hooks/useAssistantFilters";
import {
  useAssistantConversations,
  useCreateConversation,
} from "@/features/assistant/hooks/useAssistantConversations";
import { useAssistantConversation } from "@/features/assistant/hooks/useAssistantConversation";
import { useAssistantChat } from "@/features/assistant/hooks/useAssistantChat";
import { useAssistantStore } from "@/store/assistant-store";
import type { AssistantCitation } from "@/types/assistant";

interface AssistantShellProps {
  orgId: string | null;
}

export function AssistantShell({ orgId }: AssistantShellProps) {
  const { activeConversationId, selectConversation } = useAssistantFilters(orgId);
  const mobileView = useAssistantStore((s) => s.mobileView);
  const setMobileView = useAssistantStore((s) => s.setMobileView);

  const conversationsQuery = useAssistantConversations(orgId);
  const conversationQuery = useAssistantConversation(orgId, activeConversationId);
  const createMutation = useCreateConversation(orgId);
  const chatMutation = useAssistantChat(orgId);

  const overviewQuery = useQuery({
    queryKey: ["dashboard", "overview", orgId],
    queryFn: () => fetchDashboardOverview(orgId!),
    enabled: Boolean(orgId),
    staleTime: 300_000,
  });

  const conversations = useMemo(
    () => conversationsQuery.data ?? [],
    [conversationsQuery.data],
  );

  useEffect(() => {
    if (
      orgId &&
      !activeConversationId &&
      conversations.length > 0 &&
      !createMutation.isPending
    ) {
      selectConversation(conversations[0].id);
    }
  }, [
    orgId,
    activeConversationId,
    conversations,
    selectConversation,
    createMutation.isPending,
  ]);

  const allCitations = useMemo(() => {
    const citations: AssistantCitation[] = [];
    const seen = new Set<string>();
    for (const msg of conversationQuery.data?.messages ?? []) {
      if (msg.response?.citations) {
        for (const c of msg.response.citations) {
          if (!seen.has(c.id)) {
            seen.add(c.id);
            citations.push(c);
          }
        }
      }
    }
    return citations;
  }, [conversationQuery.data?.messages]);

  const handleNewConversation = useCallback(async () => {
    if (!orgId) return;
    const conv = await createMutation.mutateAsync();
    selectConversation(conv.id);
    setMobileView("chat");
  }, [orgId, createMutation, selectConversation, setMobileView]);

  const handleSend = useCallback(
    async (message: string) => {
      if (!orgId) return;

      let convId = activeConversationId;

      if (!convId) {
        const conv = await createMutation.mutateAsync();
        convId = conv.id;
        selectConversation(convId);
      }

      await chatMutation.mutateAsync({
        conversationId: convId,
        message,
      });
    },
    [
      orgId,
      activeConversationId,
      createMutation,
      selectConversation,
      chatMutation,
    ],
  );

  if (!orgId) {
    return <EmptyOrgDashboard />;
  }

  if (overviewQuery.isLoading) {
    return <PageLoadingState />;
  }

  if (
    overviewQuery.data &&
    !overviewQuery.data.hasOperationalData
  ) {
    return <EmptyOrgDashboard />;
  }

  if (conversationsQuery.isLoading && !conversationsQuery.data) {
    return <PageLoadingState />;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 md:hidden">
        <Button
          variant={mobileView === "history" ? "default" : "outline"}
          size="sm"
          onClick={() => setMobileView("history")}
          aria-pressed={mobileView === "history"}
        >
          <History className="mr-1 h-4 w-4" />
          History
        </Button>
        <Button
          variant={mobileView === "chat" ? "default" : "outline"}
          size="sm"
          onClick={() => setMobileView("chat")}
          aria-pressed={mobileView === "chat"}
        >
          <MessageSquare className="mr-1 h-4 w-4" />
          Chat
        </Button>
        <Button
          variant={mobileView === "evidence" ? "default" : "outline"}
          size="sm"
          onClick={() => setMobileView("evidence")}
          aria-pressed={mobileView === "evidence"}
        >
          <PanelRight className="mr-1 h-4 w-4" />
          Evidence
        </Button>
      </div>

      <div className="grid h-[calc(100vh-14rem)] min-h-[480px] grid-cols-1 gap-4 lg:grid-cols-[240px_1fr_280px]">
        <div
          className={
            mobileView === "history" ? "block md:block" : "hidden md:block"
          }
        >
          <ConversationSidebar
            conversations={conversations}
            activeConversationId={activeConversationId}
            isLoading={conversationsQuery.isLoading}
            onSelect={(id) => {
              selectConversation(id);
              setMobileView("chat");
            }}
            onNewConversation={() => void handleNewConversation()}
            isCreating={createMutation.isPending}
          />
        </div>

        <div
          className={
            mobileView === "chat" ? "block md:block" : "hidden md:block"
          }
        >
          {activeConversationId ? (
            <AssistantQueryState
              isLoading={conversationQuery.isLoading && !conversationQuery.data}
              isError={conversationQuery.isError}
              onRetry={() => conversationQuery.refetch()}
            >
              <ChatPanel
                conversation={conversationQuery.data ?? null}
                isSending={chatMutation.isPending}
                onSend={(msg) => void handleSend(msg)}
              />
            </AssistantQueryState>
          ) : (
            <ChatPanel
              conversation={null}
              isSending={chatMutation.isPending || createMutation.isPending}
              onSend={(msg) => void handleSend(msg)}
            />
          )}
        </div>

        <div
          className={
            mobileView === "evidence" ? "block lg:block" : "hidden lg:block"
          }
        >
          <EvidencePanel citations={allCitations} className="h-full" />
        </div>
      </div>
    </div>
  );
}
