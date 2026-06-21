import { describe, expect, it } from "vitest";
import {
  computeImpactDelta,
  mealsFromQuantity,
  quantityToKg,
} from "@/services/impact/impact-formulas";

describe("impact-formulas", () => {
  it("converts gallons to kg", () => {
    expect(quantityToKg(10, "gallons")).toBeCloseTo(37.8, 1);
  });

  it("computes meals from quantity", () => {
    expect(mealsFromQuantity(4, "kg")).toBe(10);
  });

  it("returns zero impact delta for zero quantity with override", () => {
    const delta = computeImpactDelta({ quantityKg: 0, mealsOverride: 0 });
    expect(delta.mealsSaved).toBe(0);
    expect(delta.foodDivertedKg).toBe(0);
  });

  it("computes environmental and financial impact from food kg", () => {
    const delta = computeImpactDelta({ quantityKg: 10 });
    expect(delta.mealsSaved).toBe(25);
    expect(delta.co2AvoidedKg).toBe(25);
    expect(delta.moneySaved).toBe(45);
    expect(delta.waterSavedLiters).toBe(500);
  });
});
