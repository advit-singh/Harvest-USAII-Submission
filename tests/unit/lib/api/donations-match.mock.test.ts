import { describe, expect, it } from "vitest";
import { matchDonationOpportunity } from "@/lib/api/donations";

describe("donations match mock", () => {
  it("returns ranked match candidates", async () => {
    const result = await matchDonationOpportunity("don_001");
    expect(result.opportunityId).toBe("don_001");
    expect(result.candidates.length).toBeGreaterThan(0);
    expect(result.candidates[0].matchScore).toBeGreaterThan(
      result.candidates[1]?.matchScore ?? 0,
    );
    expect(result.candidates[0].reasoning).toBeTruthy();
  });
});
