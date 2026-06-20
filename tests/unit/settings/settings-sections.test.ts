import { describe, expect, it } from "vitest";
import {
  SETTINGS_SECTIONS,
  VALID_SETTINGS_SECTIONS,
  DEFAULT_SETTINGS_SECTION,
} from "@/features/settings/config/settings-sections";

describe("settings sections config", () => {
  it("defines all required sections", () => {
    expect(SETTINGS_SECTIONS.length).toBe(9);
    expect(VALID_SETTINGS_SECTIONS).toContain("organization");
    expect(VALID_SETTINGS_SECTIONS).toContain("permissions");
    expect(VALID_SETTINGS_SECTIONS).toContain("notifications");
  });

  it("defaults to organization section", () => {
    expect(DEFAULT_SETTINGS_SECTION).toBe("organization");
  });
});
