export const assistantKeys = {
  all: ["assistant"] as const,
  conversations: (orgId: string) =>
    [...assistantKeys.all, "conversations", orgId] as const,
  conversation: (orgId: string, conversationId: string) =>
    [...assistantKeys.all, "conversation", orgId, conversationId] as const,
};
