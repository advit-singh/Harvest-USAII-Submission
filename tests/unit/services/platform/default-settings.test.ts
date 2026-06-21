import { describe, expect, it } from "vitest";
import { buildDefaultSettingsJson } from "@/services/platform/default-settings";
import { ALL_PERMISSION_CATALOG, SYSTEM_ROLE_DEFINITIONS } from "@/services/platform/system-roles";
import { severityForNotificationType } from "@/services/notification/notification-mappers";

describe("default-settings", () => {
  it("builds complete settings shape", () => {
    const settings = buildDefaultSettingsJson("org-1");
    expect(settings.organizationId).toBe("org-1");
    expect(settings.ai.assistantEnabled).toBe(true);
    expect(settings.ai.autoCommitEnabled).toBe(true);
    expect(settings.ai.autoCommitConfidenceThreshold).toBe(0.85);
    expect(settings.forecast.defaultHorizonDays).toBe(7);
    expect(settings.notifications.critical).toBe(true);
  });
});

describe("system-roles", () => {
  it("defines admin with full permission catalog coverage", () => {
    const admin = SYSTEM_ROLE_DEFINITIONS.find((role) => role.slug === "admin");
    expect(admin).toBeDefined();
    for (const perm of ALL_PERMISSION_CATALOG) {
      expect(admin!.permissionIds).toContain(perm.key);
    }
  });
});

describe("notification-mappers", () => {
  it("maps validation warnings to critical severity", () => {
    expect(severityForNotificationType("validation.warning")).toBe("critical");
  });

  it("maps report generated to informational severity", () => {
    expect(severityForNotificationType("report.generated")).toBe("informational");
  });
});
