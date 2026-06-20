import { describe, expect, it } from "vitest";
import {
  RESCUE_TABS,
  VALID_RESCUE_TABS,
  filterOpportunities,
} from "@/features/rescue/config/rescue-tabs";
import type { DonationOpportunity } from "@/types/donation";

describe("rescue-tabs", () => {
  it("defines four tabs", () => {
    expect(RESCUE_TABS).toHaveLength(4);
    expect(VALID_RESCUE_TABS).toEqual([
      "opportunities",
      "recipients",
      "history",
      "impact",
    ]);
  });

  it("filters opportunities by priority", () => {
    const items: DonationOpportunity[] = [
      {
        id: "1",
        item: "Milk",
        quantity: "10",
        expirationDate: new Date(Date.now() + 86400000).toISOString(),
        suggestedRecipientCount: 2,
        priority: "high",
        priorityScore: 90,
        predictedMealsSaved: 20,
        status: "open",
        siteName: "Site A",
      },
      {
        id: "2",
        item: "Bread",
        quantity: "5",
        expirationDate: new Date(Date.now() + 86400000).toISOString(),
        suggestedRecipientCount: 1,
        priority: "low",
        priorityScore: 40,
        predictedMealsSaved: 10,
        status: "open",
        siteName: "Site B",
      },
    ];

    const filtered = filterOpportunities(items, {
      priority: "high",
      siteId: "all",
      expirationWindow: "all",
      search: "",
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe("1");
  });
});
