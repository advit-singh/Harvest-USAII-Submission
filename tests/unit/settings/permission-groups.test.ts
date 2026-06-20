import { describe, expect, it } from "vitest";
import { PERMISSION_GROUPS, ALL_PERMISSION_IDS } from "@/features/settings/config/permission-groups";

describe("permission groups", () => {
  it("includes organization and operations permissions", () => {
    expect(PERMISSION_GROUPS.length).toBeGreaterThanOrEqual(3);
    expect(ALL_PERMISSION_IDS).toContain("org.manage");
    expect(ALL_PERMISSION_IDS).toContain("assistant.use");
  });

  it("has unique permission ids", () => {
    const unique = new Set(ALL_PERMISSION_IDS);
    expect(unique.size).toBe(ALL_PERMISSION_IDS.length);
  });
});
