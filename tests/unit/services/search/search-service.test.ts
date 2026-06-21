import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEMO_ORG_ID, DEMO_USER_ID } from "../../../helpers/service-fixtures";

const mockSelect = vi.fn();

vi.mock("@/db/client", () => ({
  db: {
    select: () => mockSelect(),
  },
}));

import { searchOrganization } from "@/services/search/search-service";

function chainResolving(rows: unknown[]) {
  return {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue(rows),
  };
}

describe("search-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelect.mockImplementation(() => chainResolving([]));
  });

  it("throws when query is empty", async () => {
    await expect(searchOrganization(DEMO_ORG_ID, DEMO_USER_ID, "   ")).rejects.toThrow(
      "QUERY_REQUIRED",
    );
  });

  it("returns grouped search results", async () => {
    mockSelect
      .mockImplementationOnce(() =>
        chainResolving([{ id: "item-1", name: "Milk", organization_id: DEMO_ORG_ID }]),
      )
      .mockImplementationOnce(() =>
        chainResolving([
          {
            id: "fc-1",
            forecast_type: "surplus",
            explanation: "Milk surplus expected",
            organization_id: DEMO_ORG_ID,
          },
        ]),
      )
      .mockImplementationOnce(() => chainResolving([]))
      .mockImplementationOnce(() => chainResolving([]))
      .mockImplementationOnce(() => chainResolving([]))
      .mockImplementationOnce(() => chainResolving([]));

    const results = await searchOrganization(DEMO_ORG_ID, DEMO_USER_ID, "Milk");
    expect(results.inventory).toHaveLength(1);
    expect(results.forecasts).toHaveLength(1);
    expect(results.inventory[0]?.title).toBe("Milk");
  });
});
