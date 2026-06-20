import { describe, expect, it } from "vitest";
import {
  WIDGET_IDS,
  WIDGET_REGISTRY,
  getWidgetDefinition,
} from "@/features/dashboard/config/widget-registry";

describe("widget registry", () => {
  it("defines exactly 7 widgets", () => {
    expect(WIDGET_REGISTRY).toHaveLength(7);
    expect(WIDGET_IDS).toHaveLength(7);
  });

  it("has unique widget ids", () => {
    const ids = WIDGET_REGISTRY.map((w) => w.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("resolves widget definitions by id", () => {
    const def = getWidgetDefinition("waste-risk");
    expect(def?.title).toBe("Waste Risk");
  });

  it("includes all required FRONTEND_SPEC widgets", () => {
    expect(WIDGET_IDS).toContain("waste-risk");
    expect(WIDGET_IDS).toContain("predicted-surplus");
    expect(WIDGET_IDS).toContain("recommendations");
    expect(WIDGET_IDS).toContain("inventory-health");
    expect(WIDGET_IDS).toContain("impact-snapshot");
    expect(WIDGET_IDS).toContain("donation-opportunities");
    expect(WIDGET_IDS).toContain("recent-activity");
  });
});
