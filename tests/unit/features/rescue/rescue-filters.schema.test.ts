import { describe, expect, it } from "vitest";
import {
  rescueFiltersSchema,
  recipientFiltersSchema,
  donationHistoryFiltersSchema,
} from "@/features/rescue/schemas/rescue-filters.schema";
import { recipientFormSchema } from "@/features/rescue/schemas/recipient-form.schema";
import { donationCompletionSchema } from "@/features/rescue/schemas/donation-completion.schema";

describe("rescue-filters.schema", () => {
  it("accepts default rescue filters", () => {
    const result = rescueFiltersSchema.safeParse({
      priority: "all",
      siteId: "all",
      expirationWindow: "all",
      search: "",
    });
    expect(result.success).toBe(true);
  });

  it("accepts recipient filters", () => {
    const result = recipientFiltersSchema.safeParse({
      foodType: "dairy",
      maxDistanceKm: 10,
      minCapacity: 20,
      search: "kitchen",
    });
    expect(result.success).toBe(true);
  });

  it("accepts donation history filters", () => {
    const result = donationHistoryFiltersSchema.safeParse({
      status: "completed",
      siteId: "all",
    });
    expect(result.success).toBe(true);
  });
});

describe("recipient-form.schema", () => {
  it("requires name and capacity", () => {
    const result = recipientFormSchema.safeParse({
      name: "Test Kitchen",
      type: "community_kitchen",
      distanceKm: 3,
      capacityMeals: 50,
      foodTypesAccepted: "produce",
      availability: "Weekdays",
      operatingHours: "9-5",
    });
    expect(result.success).toBe(true);
  });
});

describe("donation-completion.schema", () => {
  it("requires recipient and confirmation", () => {
    const result = donationCompletionSchema.safeParse({
      recipientId: "rec_001",
      notes: "Pickup at loading dock",
      confirmedByUser: true,
    });
    expect(result.success).toBe(true);
  });
});
