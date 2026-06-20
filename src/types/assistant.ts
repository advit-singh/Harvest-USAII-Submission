/** AI Assistant types — aligned with API_SPEC §44–45 and AI_SYSTEM_SPEC §36 */

export type CitationSourceType =
  | "forecast"
  | "waste"
  | "inventory"
  | "recommendation"
  | "upload"
  | "report"
  | "attendance"
  | "donation";

export type AssistantMessageRole = "user" | "assistant";

export interface AssistantCitation {
  id: string;
  sourceType: CitationSourceType;
  title: string;
  excerpt: string;
  href?: string;
  recordId?: string;
  confidence?: number;
}

export interface RecommendedAction {
  id: string;
  label: string;
  description?: string;
  href: string;
}

export interface AssistantChatResponse {
  answer: string;
  confidence: number;
  reasoning: string;
  citations: AssistantCitation[];
  recommendedActions?: RecommendedAction[];
}

export interface AssistantMessage {
  id: string;
  role: AssistantMessageRole;
  content: string;
  createdAt: string;
  response?: AssistantChatResponse;
}

export interface AssistantConversation {
  id: string;
  organizationId: string;
  title: string;
  preview: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssistantConversationDetail extends AssistantConversation {
  messages: AssistantMessage[];
}

export type AssistantMobileView = "history" | "chat" | "evidence";
