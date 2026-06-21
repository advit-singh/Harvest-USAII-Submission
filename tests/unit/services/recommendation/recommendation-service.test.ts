import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEMO_ORG_ID, DEMO_USER_ID } from "../../../helpers/service-fixtures";

const mockSelectChain = vi.fn();
const mockFindFirst = vi.fn();

vi.mock("@/db/client", () => ({
  db: {
    select: () => mockSelectChain(),
    query: {
      recommendations: { findFirst: (...args: unknown[]) => mockFindFirst(...args) },
      organization_sites: { findFirst: vi.fn().mockResolvedValue({ name: "Main Site" }) },
      users: { findFirst: vi.fn().mockResolvedValue(null) },
    },
    insert: vi.fn(() => ({
      values: vi.fn().mockResolvedValue(undefined),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn().mockResolvedValue([
            {
              id: "rec-1",
              organization_id: DEMO_ORG_ID,
              site_id: "site-1",
              status: "accepted",
              title: "Reduce dairy",
              recommendation_type: "inventory",
              priority: "high",
              confidence_score: "0.85",
              created_at: new Date(),
              updated_at: new Date(),
            },
          ]),
        })),
      })),
    })),
  },
}));

import { listRecommendations, submitRecommendationAction } from "@/services/recommendation/recommendation-service";

describe("recommendation-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const recommendationRows = [
      {
        id: "rec-1",
        organization_id: DEMO_ORG_ID,
        site_id: "site-1",
        status: "open",
        title: "Reduce dairy",
        recommendation_type: "inventory",
        priority: "high",
        confidence_score: "0.85",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];
    mockSelectChain
      .mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue(recommendationRows),
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ id: "site-1", name: "Main Site" }]),
      });
  });

  it("listRecommendations maps rows with site names", async () => {
    const results = await listRecommendations({ organizationId: DEMO_ORG_ID });
    expect(results).toHaveLength(1);
    expect(results[0]?.title).toBe("Reduce dairy");
    expect(results[0]?.siteName).toBeDefined();
  });

  it("submitRecommendationAction returns null when not found", async () => {
    mockFindFirst.mockResolvedValue(null);
    const result = await submitRecommendationAction(
      "missing",
      DEMO_ORG_ID,
      DEMO_USER_ID,
      "accepted",
    );
    expect(result).toBeNull();
  });

  it("submitRecommendationAction updates status on success", async () => {
    mockFindFirst.mockResolvedValue({
      id: "rec-1",
      organization_id: DEMO_ORG_ID,
      site_id: "site-1",
      status: "open",
    });
    const result = await submitRecommendationAction(
      "rec-1",
      DEMO_ORG_ID,
      DEMO_USER_ID,
      "accepted",
      "Approved",
    );
    expect(result?.status).toBe("accepted");
  });
});
