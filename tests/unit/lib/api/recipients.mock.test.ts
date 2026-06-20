import { describe, expect, it } from "vitest";
import { fetchRecipients, createRecipient } from "@/lib/api/recipients";

describe("recipients mock", () => {
  it("returns recipient directory for demo org", async () => {
    const recipients = await fetchRecipients("org_demo_123");
    expect(recipients.length).toBeGreaterThan(0);
    expect(recipients[0].name).toBeTruthy();
  });

  it("creates a new recipient", async () => {
    const created = await createRecipient("org_demo_123", {
      name: "Test Food Pantry",
      type: "food_bank",
      distanceKm: 4,
      capacityMeals: 100,
      foodTypesAccepted: ["produce"],
      availability: "Daily",
      operatingHours: "9-5",
    });
    expect(created.id).toBeTruthy();
    expect(created.name).toBe("Test Food Pantry");
  });
});
