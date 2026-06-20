import { describe, expect, it } from "vitest";
import {
  DEFAULT_PREDICTIONS_FILTERS,
  predictionsFiltersSchema,
} from "@/features/predictions/schemas/predictions-filters.schema";

describe("predictionsFiltersSchema", () => {
  it("accepts default filters", () => {
    const result = predictionsFiltersSchema.safeParse(DEFAULT_PREDICTIONS_FILTERS);
    expect(result.success).toBe(true);
  });

  it("rejects invalid time range", () => {
    const result = predictionsFiltersSchema.safeParse({
      ...DEFAULT_PREDICTIONS_FILTERS,
      timeRange: "year",
    });
    expect(result.success).toBe(false);
  });
});
