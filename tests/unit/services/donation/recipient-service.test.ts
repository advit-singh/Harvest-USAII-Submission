import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEMO_ORG_ID } from "../../../helpers/service-fixtures";

const mockSelect = vi.fn();
const mockInsert = vi.fn();

vi.mock("@/db/client", () => ({
  db: {
    select: (...args: unknown[]) => mockSelect(...args),
    insert: (...args: unknown[]) => mockInsert(...args),
    query: {
      donation_recipients: { findFirst: vi.fn() },
    },
  },
}));

import { listRecipients, createRecipient } from "@/services/donation/recipient-service";

describe("recipient-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelect.mockReturnValue({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue([
        {
          id: "rec-1",
          organization_id: DEMO_ORG_ID,
          name: "Food Bank",
          recipient_type: "food_bank",
          address: "123 Main St",
          contact_name: "Jane",
          phone: "555-0100",
          email: "jane@foodbank.org",
          capacity_rating: 4,
          latitude: "40.7128",
          longitude: "-74.0060",
        },
      ]),
    });
    mockInsert.mockReturnValue({
      values: vi.fn(() => ({
        returning: vi.fn().mockResolvedValue([
          {
            id: "rec-new",
            organization_id: DEMO_ORG_ID,
            name: "Shelter",
            recipient_type: "shelter",
            address: "456 Oak Ave",
            contact_name: "Shelter",
            phone: "555-0200",
            email: "shelter@example.org",
            capacity_rating: 3,
            latitude: "40.72",
            longitude: "-74.01",
          },
        ]),
      })),
    });
  });

  it("listRecipients maps database rows", async () => {
    const recipients = await listRecipients(DEMO_ORG_ID);
    expect(recipients).toHaveLength(1);
    expect(recipients[0]?.name).toBe("Food Bank");
  });

  it("createRecipient inserts and returns mapped recipient", async () => {
    const recipient = await createRecipient({
      organizationId: DEMO_ORG_ID,
      name: "Shelter",
      type: "shelter",
      address: "456 Oak Ave",
      contactPhone: "555-0200",
      contactEmail: "shelter@example.org",
      capacityMeals: 200,
      distanceKm: 5,
      foodTypesAccepted: ["produce", "dairy"],
      availability: "weekdays",
      operatingHours: "9am-5pm",
    });
    expect(recipient.name).toBe("Shelter");
    expect(recipient.distanceKm).toBe(5);
  });
});
