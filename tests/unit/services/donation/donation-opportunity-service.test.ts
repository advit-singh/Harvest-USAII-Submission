import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEMO_ORG_ID } from "../../../helpers/service-fixtures";

const mockInsert = vi.fn();
const mockSelect = vi.fn();

vi.mock("@/db/client", () => ({
  db: {
    insert: (...args: unknown[]) => mockInsert(...args),
    select: (...args: unknown[]) => mockSelect(...args),
    query: {
      donation_opportunities: { findFirst: vi.fn().mockResolvedValue(null) },
    },
  },
}));

import { countRecipients } from "@/services/donation/donation-opportunity-service";

describe("donation-opportunity-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelect.mockReturnValue({
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue([]),
    });
  });

  it("countRecipients returns zero when no recipients", async () => {
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ count: 0 }]),
    });
    const count = await countRecipients(DEMO_ORG_ID);
    expect(count).toBe(0);
  });
});
