import { describe, expect, it } from "vitest";
import { rankRecipients } from "@/services/donation/donation-matching-engine";

const baseOpportunity = {
  opportunityId: "opp-1",
  itemName: "Whole Milk",
  unit: "gallons",
  quantity: 24,
  expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
  priorityScore: 85,
  siteLatitude: "41.8781",
  siteLongitude: "-87.6298",
};

describe("donation-matching-engine", () => {
  it("ranks closer recipients higher", () => {
    const candidates = rankRecipients(baseOpportunity, [
      {
        id: "near",
        name: "Near Pantry",
        recipientType: "food_bank",
        latitude: "41.8819",
        longitude: "-87.6231",
        capacityRating: 4,
      },
      {
        id: "far",
        name: "Far Shelter",
        recipientType: "shelter",
        latitude: "42.0",
        longitude: "-88.0",
        capacityRating: 3,
      },
    ]);

    expect(candidates[0]?.recipientId).toBe("near");
    expect(candidates[0]?.matchScore).toBeGreaterThan(candidates[1]?.matchScore ?? 0);
  });

  it("includes explainable factors", () => {
    const candidates = rankRecipients(baseOpportunity, [
      {
        id: "r1",
        name: "Kitchen",
        recipientType: "community_kitchen",
        latitude: "41.8756",
        longitude: "-87.6244",
        capacityRating: 5,
      },
    ]);

    expect(candidates[0]?.factors.length).toBeGreaterThanOrEqual(4);
    expect(candidates[0]?.reasoning).toContain("Match score");
  });

  it("uses fallback distance when coordinates missing", () => {
    const candidates = rankRecipients(
      { ...baseOpportunity, siteLatitude: null, siteLongitude: null },
      [
        {
          id: "r1",
          name: "Partner",
          recipientType: "food_bank",
          latitude: null,
          longitude: null,
          capacityRating: 3,
        },
      ],
    );

    expect(candidates[0]?.distanceKm).toBe(5);
  });
});
