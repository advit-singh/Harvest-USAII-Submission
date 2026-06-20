import { describe, expect, it } from "vitest";
import { inviteMemberSchema } from "@/features/settings/schemas/invite-member.schema";
import { roleFormSchema } from "@/features/settings/schemas/role-form.schema";
import { aiSettingsSchema } from "@/features/settings/schemas/ai-settings.schema";
import { notificationPreferencesSchema } from "@/features/settings/schemas/notification-preferences.schema";

describe("settings schemas", () => {
  it("validates invite member input", () => {
    const result = inviteMemberSchema.safeParse({
      email: "ops@school.edu",
      roleId: "role_ops",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid invite email", () => {
    const result = inviteMemberSchema.safeParse({
      email: "not-an-email",
      roleId: "role_ops",
    });
    expect(result.success).toBe(false);
  });

  it("validates role form with permissions", () => {
    const result = roleFormSchema.safeParse({
      name: "Site Lead",
      description: "Campus operations",
      permissionIds: ["uploads.manage", "forecasts.view"],
    });
    expect(result.success).toBe(true);
  });

  it("validates AI settings", () => {
    const result = aiSettingsSchema.safeParse({
      confidenceVisibility: true,
      memoryEnabled: true,
      recommendationAggressiveness: "medium",
      assistantEnabled: true,
    });
    expect(result.success).toBe(true);
  });

  it("validates notification preferences", () => {
    const result = notificationPreferencesSchema.safeParse({
      critical: true,
      warning: true,
      informational: false,
      emailDigest: true,
    });
    expect(result.success).toBe(true);
  });
});
