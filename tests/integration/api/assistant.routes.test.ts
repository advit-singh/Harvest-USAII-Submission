import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetRateLimitBuckets } from "@/lib/api/rate-limit";
import {
  buildRequest,
  expectErrorEnvelope,
  expectSuccessEnvelope,
  mockAuthSuccess,
  orgQueryUrl,
  TestAuthError,
} from "../../helpers/api-test-utils";
import { DEMO_CONVERSATION_ID, DEMO_ORG_ID } from "../../helpers/service-fixtures";

const authMocks = vi.hoisted(() => ({
  requireAuthenticatedUser: vi.fn(),
  requireOrgMembership: vi.fn(),
}));

const assistantService = vi.hoisted(() => ({
  listConversations: vi.fn(),
  createConversation: vi.fn(),
  getConversationById: vi.fn(),
  sendChatMessage: vi.fn(),
}));

vi.mock("@/lib/api/auth", () => ({
  ...authMocks,
  AuthError: TestAuthError,
}));

vi.mock("@/services/assistant/assistant-service", () => assistantService);

import { POST as chat } from "@/app/api/v1/assistant/chat/route";
import {
  GET as listConversations,
  POST as createConversation,
} from "@/app/api/v1/assistant/conversations/route";
import { GET as getConversation } from "@/app/api/v1/assistant/conversations/[id]/route";

const params = Promise.resolve({ id: DEMO_CONVERSATION_ID });

beforeEach(() => {
  vi.clearAllMocks();
  resetRateLimitBuckets();
  const auth = mockAuthSuccess();
  authMocks.requireAuthenticatedUser.mockImplementation(auth.requireAuthenticatedUser);
  authMocks.requireOrgMembership.mockImplementation(auth.requireOrgMembership);
});

describe("POST /api/v1/assistant/chat", () => {
  it("sends chat message on success", async () => {
    const reply = { message: "Here is your waste summary.", role: "assistant" };
    assistantService.sendChatMessage.mockResolvedValue(reply);

    const response = await chat(
      buildRequest("http://localhost:3000/api/v1/assistant/chat", {
        method: "POST",
        body: { conversationId: DEMO_CONVERSATION_ID, message: "Summarize waste" },
      }),
    );
    const body = await expectSuccessEnvelope(response);
    expect(body.data).toEqual(reply);
  });

  it("returns 401 when unauthorized", async () => {
    authMocks.requireAuthenticatedUser.mockRejectedValueOnce(
      new TestAuthError("UNAUTHORIZED", "Authentication required."),
    );

    const response = await chat(
      buildRequest("http://localhost:3000/api/v1/assistant/chat", {
        method: "POST",
        body: { conversationId: DEMO_CONVERSATION_ID, message: "Hello" },
      }),
    );
    await expectErrorEnvelope(response, "UNAUTHORIZED", 401);
  });

  it("returns 400 when message is missing", async () => {
    const response = await chat(
      buildRequest("http://localhost:3000/api/v1/assistant/chat", {
        method: "POST",
        body: { conversationId: DEMO_CONVERSATION_ID },
      }),
    );
    await expectErrorEnvelope(response, "VALIDATION_ERROR", 400);
  });
});

describe("GET /api/v1/assistant/conversations", () => {
  it("lists conversations on success", async () => {
    const conversations = [{ id: DEMO_CONVERSATION_ID, title: "Waste Q&A" }];
    assistantService.listConversations.mockResolvedValue(conversations);

    const response = await listConversations(
      buildRequest(orgQueryUrl("/api/v1/assistant/conversations")),
    );
    const body = await expectSuccessEnvelope(response);
    expect(body.data).toEqual(conversations);
  });

  it("returns 401 when unauthorized", async () => {
    authMocks.requireAuthenticatedUser.mockRejectedValueOnce(
      new TestAuthError("UNAUTHORIZED", "Authentication required."),
    );

    const response = await listConversations(
      buildRequest(orgQueryUrl("/api/v1/assistant/conversations")),
    );
    await expectErrorEnvelope(response, "UNAUTHORIZED", 401);
  });

  it("returns 400 when organizationId is missing", async () => {
    const response = await listConversations(
      buildRequest("http://localhost:3000/api/v1/assistant/conversations"),
    );
    await expectErrorEnvelope(response, "VALIDATION_ERROR", 400);
  });
});

describe("POST /api/v1/assistant/conversations", () => {
  it("creates conversation on success", async () => {
    const conversation = { id: DEMO_CONVERSATION_ID, title: "New chat" };
    assistantService.createConversation.mockResolvedValue(conversation);

    const response = await createConversation(
      buildRequest("http://localhost:3000/api/v1/assistant/conversations", {
        method: "POST",
        body: { organizationId: DEMO_ORG_ID },
      }),
    );
    const body = await expectSuccessEnvelope(response, 201);
    expect(body.data).toEqual(conversation);
  });

  it("returns 401 when unauthorized", async () => {
    authMocks.requireAuthenticatedUser.mockRejectedValueOnce(
      new TestAuthError("UNAUTHORIZED", "Authentication required."),
    );

    const response = await createConversation(
      buildRequest("http://localhost:3000/api/v1/assistant/conversations", {
        method: "POST",
        body: { organizationId: DEMO_ORG_ID },
      }),
    );
    await expectErrorEnvelope(response, "UNAUTHORIZED", 401);
  });

  it("returns 400 when organizationId is missing", async () => {
    const response = await createConversation(
      buildRequest("http://localhost:3000/api/v1/assistant/conversations", {
        method: "POST",
        body: {},
      }),
    );
    await expectErrorEnvelope(response, "VALIDATION_ERROR", 400);
  });
});

describe("GET /api/v1/assistant/conversations/[id]", () => {
  it("returns conversation detail on success", async () => {
    const conversation = { id: DEMO_CONVERSATION_ID, messages: [] };
    assistantService.getConversationById.mockResolvedValue(conversation);

    const response = await getConversation(
      buildRequest(`http://localhost:3000/api/v1/assistant/conversations/${DEMO_CONVERSATION_ID}`),
      { params },
    );
    const body = await expectSuccessEnvelope(response);
    expect(body.data).toEqual(conversation);
  });

  it("returns 401 when unauthorized", async () => {
    authMocks.requireAuthenticatedUser.mockRejectedValueOnce(
      new TestAuthError("UNAUTHORIZED", "Authentication required."),
    );

    const response = await getConversation(
      buildRequest(`http://localhost:3000/api/v1/assistant/conversations/${DEMO_CONVERSATION_ID}`),
      { params },
    );
    await expectErrorEnvelope(response, "UNAUTHORIZED", 401);
  });

  it("returns 404 when conversation does not exist", async () => {
    assistantService.getConversationById.mockResolvedValue(null);

    const response = await getConversation(
      buildRequest(`http://localhost:3000/api/v1/assistant/conversations/${DEMO_CONVERSATION_ID}`),
      { params },
    );
    await expectErrorEnvelope(response, "NOT_FOUND", 404);
  });
});
