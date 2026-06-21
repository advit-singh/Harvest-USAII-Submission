import type {
  AssistantChatResponse,
  AssistantConversation,
  AssistantConversationDetail,
  AssistantMessage,
} from "@/types/assistant";

const DEMO_ORG = "org_demo_123";

const WOW_MOMENT_RESPONSE: AssistantChatResponse = {
  answer:
    "Next Thursday you are projected to waste 47 meals because attendance historically drops after exam days and rain is forecasted. Reducing production by 11% and redirecting excess dairy inventory could prevent $214 in waste and rescue 38 meals.",
  confidence: 0.87,
  reasoning:
    "I analyzed attendance patterns from the last 6 exam weeks (avg. 12% drop), cross-referenced with the 7-day surplus forecast for Lincoln Elementary Cafeteria, and reviewed dairy lot expiration dates. Rain on Thursday correlates with a further 8% lunch participation decline in your historical data.",
  citations: [
    {
      id: "cite_fc_001",
      sourceType: "forecast",
      title: "Surplus forecast — Lincoln Elementary",
      excerpt: "47 surplus meals projected for Thu Jun 26 with 82% confidence.",
      href: "/predictions?tab=explorer",
      recordId: "fc_001",
      confidence: 0.82,
    },
    {
      id: "cite_att_001",
      sourceType: "attendance",
      title: "Exam week attendance pattern",
      excerpt: "Average 12% drop in lunch participation during exam weeks.",
      href: "/analytics?tab=attendance",
      recordId: "att_exam",
    },
    {
      id: "cite_inv_001",
      sourceType: "inventory",
      title: "Dairy inventory — expiring Jun 25",
      excerpt: "18 gallons whole milk and 12 lbs cheese approaching expiration.",
      href: "/analytics?tab=inventory",
      recordId: "inv_dairy",
    },
    {
      id: "cite_rec_001",
      sourceType: "recommendation",
      title: "Reduce production 11% on exam days",
      excerpt: "Expected savings $214; confidence 85%.",
      href: "/predictions?tab=recommendations",
      recordId: "rec_001",
      confidence: 0.85,
    },
  ],
  recommendedActions: [
    {
      id: "act_001",
      label: "Review forecast detail",
      description: "Inspect contributing factors for Thursday surplus",
      href: "/predictions?tab=explorer",
    },
    {
      id: "act_002",
      label: "Accept production recommendation",
      description: "Reduce production by 11% for exam day",
      href: "/predictions?tab=recommendations",
    },
    {
      id: "act_003",
      label: "Schedule dairy rescue",
      description: "Match expiring dairy with nearby recipients",
      href: "/rescue?tab=opportunities",
    },
  ],
};

const GENERIC_RESPONSES: Record<string, AssistantChatResponse> = {
  waste: {
    answer:
      "Waste increased 14% this month compared to last month, primarily driven by overproduction on rainy days and dairy spoilage. The largest spike occurred the week of Jun 9 when attendance dropped 9% while production remained unchanged.",
    confidence: 0.84,
    reasoning:
      "Compared waste_records for the current and prior 30-day windows. Rain-correlated days account for 62% of the increase. Dairy category represents 38% of preventable waste.",
    citations: [
      {
        id: "cite_waste_001",
        sourceType: "waste",
        title: "Monthly waste summary",
        excerpt: "Total waste up 14% MoM; dairy category +22%.",
        href: "/analytics?tab=waste",
      },
    ],
    recommendedActions: [
      {
        id: "act_waste_001",
        label: "Explore waste analytics",
        href: "/analytics?tab=waste",
      },
    ],
  },
  inventory: {
    answer:
      "Prioritize dairy and prepared proteins this week. 18 gallons of milk expire by Jun 25, and 34 lbs of prepared chicken should be redirected within 48 hours based on forecast demand.",
    confidence: 0.81,
    reasoning:
      "Ranked inventory lots by expiration date and forecast consumption rate. Items with less than 2 days shelf life and surplus forecast are highest priority.",
    citations: [
      {
        id: "cite_inv_002",
        sourceType: "inventory",
        title: "Expiring inventory report",
        excerpt: "12 SKUs expiring within 72 hours.",
        href: "/analytics?tab=inventory",
      },
    ],
    recommendedActions: [
      {
        id: "act_inv_001",
        label: "View inventory analytics",
        href: "/analytics?tab=inventory",
      },
    ],
  },
  default: {
    answer:
      "Based on your operational data, I can help explain waste trends, forecast risks, inventory priorities, and donation opportunities. Try asking about a specific site, time period, or food category for a detailed analysis with evidence.",
    confidence: 0.75,
    reasoning:
      "General guidance response when no specific pattern matched. Organizational data is available across uploads, forecasts, and recommendations.",
    citations: [],
    recommendedActions: [
      {
        id: "act_def_001",
        label: "View dashboard overview",
        href: "/dashboard",
      },
    ],
  },
};

export function matchFixtureResponse(message: string): AssistantChatResponse {
  const lower = message.toLowerCase();
  if (
    lower.includes("waste") &&
    (lower.includes("higher") || lower.includes("increase") || lower.includes("why"))
  ) {
    return GENERIC_RESPONSES.waste;
  }
  if (
    lower.includes("inventory") ||
    lower.includes("prioritize") ||
    lower.includes("expir")
  ) {
    return GENERIC_RESPONSES.inventory;
  }
  if (
    lower.includes("thursday") ||
    lower.includes("exam") ||
    lower.includes("47 meals") ||
    lower.includes("projected")
  ) {
    return WOW_MOMENT_RESPONSE;
  }
  if (lower.includes("order less") || lower.includes("production")) {
    return {
      ...WOW_MOMENT_RESPONSE,
      answer:
        "Reduce chicken production by 11% and dairy orders by 15% on exam days. Historical data shows these categories have the highest surplus-to-demand ratio when attendance drops.",
      reasoning:
        "Analyzed purchase orders vs. actual consumption on prior exam weeks. Chicken and dairy show 18% and 22% overproduction respectively.",
    };
  }
  return GENERIC_RESPONSES.default;
}

const seededMessages: AssistantMessage[] = [
  {
    id: "msg_seed_001",
    role: "user",
    content: "Why was waste higher this month?",
    createdAt: "2026-06-19T14:00:00Z",
  },
  {
    id: "msg_seed_002",
    role: "assistant",
    content: GENERIC_RESPONSES.waste.answer,
    createdAt: "2026-06-19T14:00:02Z",
    response: GENERIC_RESPONSES.waste,
  },
];

let mockConversations: AssistantConversationDetail[] = [
  {
    id: "conv_demo_001",
    organizationId: DEMO_ORG,
    title: "Why was waste higher this month?",
    preview: GENERIC_RESPONSES.waste.answer.slice(0, 80) + "...",
    createdAt: "2026-06-19T14:00:00Z",
    updatedAt: "2026-06-19T14:00:02Z",
    messages: seededMessages,
  },
];

export function resetMockAssistant(): void {
  mockConversations = [
    {
      id: "conv_demo_001",
      organizationId: DEMO_ORG,
      title: "Why was waste higher this month?",
      preview: GENERIC_RESPONSES.waste.answer.slice(0, 80) + "...",
      createdAt: "2026-06-19T14:00:00Z",
      updatedAt: "2026-06-19T14:00:02Z",
      messages: [...seededMessages],
    },
  ];
}

export function getMockConversations(orgId: string): AssistantConversation[] {
  return mockConversations
    .filter((c) => c.organizationId === orgId)
    .map((c) => ({
      id: c.id,
      organizationId: c.organizationId,
      title: c.title,
      preview: c.preview,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }))
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
}

export function getMockConversationById(
  id: string,
): AssistantConversationDetail | undefined {
  return mockConversations.find((c) => c.id === id);
}

export function createMockConversation(orgId: string): AssistantConversationDetail {
  const now = new Date().toISOString();
  const conv: AssistantConversationDetail = {
    id: `conv_${Date.now()}`,
    organizationId: orgId,
    title: "New conversation",
    preview: "Ask a question about your operations...",
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
  mockConversations = [conv, ...mockConversations];
  return conv;
}

export function appendMockMessageWithResponse(
  conversationId: string,
  userMessage: string,
  response: AssistantChatResponse,
): { userMsg: AssistantMessage; assistantMsg: AssistantMessage } {
  const conv = mockConversations.find((c) => c.id === conversationId);
  if (!conv) {
    throw new Error("Conversation not found");
  }

  const now = Date.now();
  const userMsg: AssistantMessage = {
    id: `msg_${now}_user`,
    role: "user",
    content: userMessage,
    createdAt: new Date(now).toISOString(),
  };

  const assistantMsg: AssistantMessage = {
    id: `msg_${now}_assistant`,
    role: "assistant",
    content: response.answer,
    createdAt: new Date(now + 500).toISOString(),
    response,
  };

  conv.messages = [...conv.messages, userMsg, assistantMsg];
  conv.updatedAt = assistantMsg.createdAt;
  conv.preview = response.answer.slice(0, 80) + (response.answer.length > 80 ? "..." : "");
  if (conv.messages.length <= 2) {
    conv.title =
      userMessage.length > 48 ? userMessage.slice(0, 48) + "..." : userMessage;
  }

  mockConversations = mockConversations.map((c) =>
    c.id === conversationId ? conv : c,
  );

  return { userMsg, assistantMsg };
}

export function appendMockMessage(
  conversationId: string,
  userMessage: string,
): { userMsg: AssistantMessage; assistantMsg: AssistantMessage } {
  const conv = mockConversations.find((c) => c.id === conversationId);
  if (!conv) {
    throw new Error("Conversation not found");
  }

  const now = Date.now();
  const userMsg: AssistantMessage = {
    id: `msg_${now}_user`,
    role: "user",
    content: userMessage,
    createdAt: new Date(now).toISOString(),
  };

  const response = matchFixtureResponse(userMessage);
  const assistantMsg: AssistantMessage = {
    id: `msg_${now}_assistant`,
    role: "assistant",
    content: response.answer,
    createdAt: new Date(now + 500).toISOString(),
    response,
  };

  conv.messages = [...conv.messages, userMsg, assistantMsg];
  conv.updatedAt = assistantMsg.createdAt;
  conv.preview = response.answer.slice(0, 80) + (response.answer.length > 80 ? "..." : "");
  if (conv.messages.length <= 2) {
    conv.title =
      userMessage.length > 48 ? userMessage.slice(0, 48) + "..." : userMessage;
  }

  mockConversations = mockConversations.map((c) =>
    c.id === conversationId ? conv : c,
  );

  return { userMsg, assistantMsg };
}

export function getMockChatResponse(message: string): AssistantChatResponse {
  return matchFixtureResponse(message);
}
