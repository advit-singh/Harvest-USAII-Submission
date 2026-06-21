/**
 * Public environmental conversion factors (AI_SYSTEM_SPEC §28–30).
 * Values are approximate demo-grade constants suitable for hackathon deployment.
 */

/** Kilograms of food diverted per meal equivalent. */
export const KG_PER_MEAL = 0.4;

/** kg CO₂ avoided per kg of food diverted from landfill. */
export const CO2_KG_PER_FOOD_KG = 2.5;

/** Liters of water saved per kg of food diverted. */
export const WATER_L_PER_FOOD_KG = 50;

/** Average cost per kg of rescued food (inventory value preserved). */
export const COST_PER_FOOD_KG = 4.5;

/** People served per meal rescued (community impact). */
export const PEOPLE_PER_MEAL = 1;

export interface ImpactDeltaInput {
  quantityKg: number;
  mealsOverride?: number;
}

export interface ImpactDelta {
  mealsSaved: number;
  foodDivertedKg: number;
  moneySaved: number;
  co2AvoidedKg: number;
  waterSavedLiters: number;
  peopleServed: number;
}

export function quantityToKg(quantity: number, unit: string): number {
  const normalized = unit.toLowerCase().trim();
  if (normalized.includes("gallon")) return quantity * 3.78;
  if (normalized.includes("kg") || normalized === "kilograms") return quantity;
  if (normalized.includes("lb") || normalized.includes("pound")) return quantity * 0.453;
  if (normalized.includes("unit") || normalized.includes("each")) return quantity * KG_PER_MEAL;
  if (normalized.includes("loaf") || normalized.includes("loaves")) return quantity * 0.5;
  return quantity * KG_PER_MEAL;
}

export function mealsFromQuantity(quantity: number, unit: string): number {
  const kg = quantityToKg(quantity, unit);
  return Math.max(1, Math.round(kg / KG_PER_MEAL));
}

export function computeImpactDelta(input: ImpactDeltaInput): ImpactDelta {
  const foodDivertedKg = Math.max(0, input.quantityKg);
  const mealsSaved =
    input.mealsOverride ?? Math.max(1, Math.round(foodDivertedKg / KG_PER_MEAL));

  return {
    mealsSaved,
    foodDivertedKg: Math.round(foodDivertedKg * 100) / 100,
    moneySaved: Math.round(foodDivertedKg * COST_PER_FOOD_KG * 100) / 100,
    co2AvoidedKg: Math.round(foodDivertedKg * CO2_KG_PER_FOOD_KG * 100) / 100,
    waterSavedLiters: Math.round(foodDivertedKg * WATER_L_PER_FOOD_KG),
    peopleServed: Math.round(mealsSaved * PEOPLE_PER_MEAL),
  };
}

export type ImpactMetricType =
  | "meals_saved"
  | "food_diverted"
  | "water_saved"
  | "co2_avoided"
  | "money_saved"
  | "people_served";

export const METRIC_TYPE_LABELS: Record<ImpactMetricType, string> = {
  meals_saved: "Meals Saved",
  food_diverted: "Food Diverted",
  water_saved: "Water Saved",
  co2_avoided: "CO2 Avoided",
  money_saved: "Money Saved",
  people_served: "People Served",
};
