import { describe, expect, it } from "vitest";
import {
  fetchRecommendations,
  submitRecommendationAction,
} from "@/lib/api/recommendations";
import { resetMockRecommendations } from "@/lib/mocks/dashboard-fixtures";

describe("recommendations mock API", () => {
  it("returns open recommendations", async () => {
    resetMockRecommendations();
    const items = await fetchRecommendations({
      orgId: "org_test",
      status: "open",
      limit: 3,
    });
    expect(items.length).toBeGreaterThan(0);
    expect(items[0].status).toBe("open");
  });

  it("updates recommendation on action", async () => {
    resetMockRecommendations();
    const items = await fetchRecommendations({ orgId: "org_test", limit: 1 });
    const id = items[0].id;

    const updated = await submitRecommendationAction(id, {
      action: "accepted",
    });
    expect(updated.status).toBe("accepted");

    const remaining = await fetchRecommendations({
      orgId: "org_test",
      status: "open",
    });
    expect(remaining.find((r) => r.id === id)).toBeUndefined();
  });
});
