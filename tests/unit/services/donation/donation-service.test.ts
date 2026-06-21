import { describe, expect, it, vi } from "vitest";
import { completeDonation, dismissDonationOpportunity } from "@/services/donation/donation-service";
import { getOpportunityContext } from "@/services/donation/donation-opportunity-service";
import { DEMO_ORG_ID } from "../../../helpers/service-fixtures";

vi.mock("@/services/donation/donation-opportunity-service", () => ({
  getOpportunityContext: vi.fn(),
  listOpportunityContexts: vi.fn(),
  countRecipients: vi.fn(),
}));

vi.mock("@/services/donation/recipient-service", () => ({
  getRecipientById: vi.fn(),
  loadRecipientContexts: vi.fn(),
}));

vi.mock("@/services/impact/impact-service", () => ({
  recordImpactDelta: vi.fn(),
}));

vi.mock("@/db/client", () => ({
  db: {
    delete: vi.fn(() => ({ where: vi.fn().mockResolvedValue(undefined) })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn().mockResolvedValue([{ id: "event-1" }]),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn().mockResolvedValue(undefined),
      })),
    })),
    query: {
      donation_events: { findFirst: vi.fn().mockResolvedValue(null) },
      donation_recipients: { findFirst: vi.fn().mockResolvedValue(null) },
    },
    select: vi.fn(() => ({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    })),
  },
}));

describe("donation-service", () => {
  it("completeDonation requires human confirmation", async () => {
    await expect(
      completeDonation("opp-1", DEMO_ORG_ID, {
        recipientId: "rec-1",
        confirmedByUser: false,
      }),
    ).rejects.toThrow("Human confirmation required");
  });

  it("completeDonation returns null when opportunity not found", async () => {
    vi.mocked(getOpportunityContext).mockResolvedValue(null);
    const result = await completeDonation("missing", DEMO_ORG_ID, {
      recipientId: "rec-1",
      confirmedByUser: true,
    });
    expect(result).toBeNull();
  });

  it("completeDonation throws when opportunity is already completed", async () => {
    vi.mocked(getOpportunityContext).mockResolvedValue({
      row: { id: "opp-1", status: "completed", predicted_surplus_quantity: "10" },
      lot: {
        itemName: "Milk",
        unit: "gal",
        remainingQuantity: 10,
        siteId: "site-1",
        siteName: "Main",
        expirationDate: new Date(),
        siteLatitude: 40,
        siteLongitude: -74,
      },
    } as never);

    await expect(
      completeDonation("opp-1", DEMO_ORG_ID, {
        recipientId: "rec-1",
        confirmedByUser: true,
      }),
    ).rejects.toThrow("no longer actionable");
  });

  it("dismissDonationOpportunity returns null when not found", async () => {
    vi.mocked(getOpportunityContext).mockResolvedValue(null);
    const result = await dismissDonationOpportunity("missing", DEMO_ORG_ID);
    expect(result).toBeNull();
  });

  it("dismissDonationOpportunity updates status", async () => {
    vi.mocked(getOpportunityContext).mockResolvedValue({
      row: { id: "opp-1", status: "open", reason: "Expiring" },
      lot: { itemName: "Bread", unit: "loaf", remainingQuantity: 5 },
    } as never);

    const result = await dismissDonationOpportunity("opp-1", DEMO_ORG_ID, "Not needed");
    expect(result?.status).toBe("dismissed");
  });
});
