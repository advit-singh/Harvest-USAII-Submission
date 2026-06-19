import { describe, expect, it } from "vitest";
import { colors, spacing, radius } from "@/design-system/tokens";

describe("design system tokens", () => {
  it("matches Harvest Green primary color", () => {
    expect(colors.primary.DEFAULT).toBe("#2F6B4F");
  });

  it("matches 8px spacing base unit", () => {
    expect(spacing[2]).toBe("8px");
  });

  it("matches border radius scale", () => {
    expect(radius.md).toBe("12px");
  });

  it("includes dark mode background", () => {
    expect(colors.dark.background).toBe("#0F1F18");
  });
});
