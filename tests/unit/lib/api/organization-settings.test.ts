import { describe, expect, it, beforeEach } from "vitest";
import {
  fetchOrganizationSettings,
  updateOrganizationSettings,
} from "@/lib/api/organization-settings";
import { resetMockOrganizationSettings } from "@/lib/mocks/settings-fixtures";

describe("organization settings mock API", () => {
  beforeEach(() => {
    resetMockOrganizationSettings();
  });

  it("returns default settings for org", async () => {
    const settings = await fetchOrganizationSettings("org_test");
    expect(settings.organizationId).toBe("org_test");
    expect(settings.ai.assistantEnabled).toBe(true);
    expect(settings.forecast.defaultHorizonDays).toBe(7);
  });

  it("patches AI settings", async () => {
    const updated = await updateOrganizationSettings("org_test", {
      ai: { recommendationAggressiveness: "high" },
    });
    expect(updated.ai.recommendationAggressiveness).toBe("high");

    const fetched = await fetchOrganizationSettings("org_test");
    expect(fetched.ai.recommendationAggressiveness).toBe("high");
  });

  it("patches notification preferences", async () => {
    const updated = await updateOrganizationSettings("org_test", {
      notifications: { informational: false },
    });
    expect(updated.notifications.informational).toBe(false);
  });
});
