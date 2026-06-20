import { describe, expect, it } from "vitest";
import {
  dashboardLayoutStateSchema,
  gridLayoutItemSchema,
  impactTimeRangeSchema,
  recommendationActionSchema,
  widgetIdSchema,
} from "@/features/dashboard/schemas/dashboard.schema";
import { DEFAULT_LAYOUTS } from "@/store/dashboard-store";

describe("dashboard schemas", () => {
  it("validates widget ids", () => {
    expect(widgetIdSchema.parse("waste-risk")).toBe("waste-risk");
    expect(() => widgetIdSchema.parse("invalid")).toThrow();
  });

  it("validates grid layout items", () => {
    const item = DEFAULT_LAYOUTS[0];
    expect(gridLayoutItemSchema.parse(item)).toEqual(item);
  });

  it("validates dashboard layout state", () => {
    const state = {
      layouts: DEFAULT_LAYOUTS,
      visibility: {
        "waste-risk": true,
        "predicted-surplus": true,
        recommendations: true,
        "inventory-health": true,
        "impact-snapshot": true,
        "donation-opportunities": true,
        "recent-activity": true,
      },
      updatedAt: new Date().toISOString(),
    };
    expect(dashboardLayoutStateSchema.parse(state)).toEqual(state);
  });

  it("validates impact time ranges", () => {
    expect(impactTimeRangeSchema.parse("week")).toBe("week");
    expect(impactTimeRangeSchema.parse("month")).toBe("month");
  });

  it("validates recommendation actions", () => {
    expect(recommendationActionSchema.parse({ action: "accepted" })).toEqual({
      action: "accepted",
    });
  });
});
