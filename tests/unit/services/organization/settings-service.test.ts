import { describe, expect, it } from "vitest";
import { buildDefaultSettingsJson } from "@/services/platform/default-settings";

describe("settings-service helpers", () => {
  it("merges partial settings patches logically", () => {
    const current = buildDefaultSettingsJson("org-1");
    const patched = {
      ...current,
      ai: { ...current.ai, recommendationAggressiveness: "low" as const },
      notifications: { ...current.notifications, emailDigest: true },
      updatedAt: new Date().toISOString(),
    };

    expect(patched.ai.recommendationAggressiveness).toBe("low");
    expect(patched.notifications.emailDigest).toBe(true);
    expect(patched.forecast.defaultHorizonDays).toBe(7);
  });
});
