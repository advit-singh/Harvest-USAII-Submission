import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEMO_CONVERSATION_ID,
  DEMO_ORG_ID,
  DEMO_USER_ID,
} from "../../../helpers/service-fixtures";

const mockInsert = vi.fn();

vi.mock("@/db/client", () => ({
  db: {
    insert: (...args: unknown[]) => mockInsert(...args),
  },
}));

vi.mock("@/services/assistant/retrieval-service", () => ({
  retrieveOrganizationContext: vi.fn(),
}));

import { createConversation } from "@/services/assistant/assistant-service";

describe("assistant-service", () => {
  const now = new Date();

  beforeEach(() => {
    vi.clearAllMocks();
    mockInsert.mockReturnValue({
      values: vi.fn(() => ({
        returning: vi.fn().mockResolvedValue([
          {
            id: DEMO_CONVERSATION_ID,
            organization_id: DEMO_ORG_ID,
            user_id: DEMO_USER_ID,
            title: "New conversation",
            created_at: now,
            updated_at: now,
          },
        ]),
      })),
    });
  });

  it("createConversation inserts a conversation and returns empty detail", async () => {
    const detail = await createConversation(DEMO_ORG_ID, DEMO_USER_ID);

    expect(mockInsert).toHaveBeenCalled();
    expect(detail.id).toBe(DEMO_CONVERSATION_ID);
    expect(detail.organizationId).toBe(DEMO_ORG_ID);
    expect(detail.title).toBe("New conversation");
    expect(detail.messages).toEqual([]);
  });
});
