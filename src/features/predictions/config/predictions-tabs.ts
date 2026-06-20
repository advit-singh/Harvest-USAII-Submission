import type { PredictionsFilters, PredictionsTabId } from "@/types/predictions";
import type { PredictionsFiltersInput } from "@/features/predictions/schemas/predictions-filters.schema";
import {
  FlaskConical,
  LayoutGrid,
  Search,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface PredictionsTabConfig {
  id: PredictionsTabId;
  label: string;
  description: string;
  icon: LucideIcon;
}

export const PREDICTIONS_TABS: PredictionsTabConfig[] = [
  {
    id: "summary",
    label: "Summary",
    description: "Forecast overview at a glance",
    icon: LayoutGrid,
  },
  {
    id: "explorer",
    label: "Explorer",
    description: "Explore forecasts with filters and factors",
    icon: Search,
  },
  {
    id: "recommendations",
    label: "Recommendations",
    description: "Review and act on AI recommendations",
    icon: Sparkles,
  },
  {
    id: "simulator",
    label: "Simulator",
    description: "Explore what-if scenarios",
    icon: FlaskConical,
  },
];

export const TIME_RANGE_OPTIONS = [
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "quarter", label: "This quarter" },
] as const;

export const SITE_OPTIONS = [
  { value: "all", label: "All sites" },
  { value: "site_001", label: "Lincoln Elementary Cafeteria" },
] as const;

export const CATEGORY_OPTIONS = [
  { value: "all", label: "All categories" },
  { value: "dairy", label: "Dairy" },
  { value: "produce", label: "Produce" },
  { value: "grains", label: "Grains" },
  { value: "protein", label: "Protein" },
] as const;

export const FORECAST_TYPE_OPTIONS = [
  { value: "all", label: "All types" },
  { value: "surplus", label: "Surplus" },
  { value: "waste", label: "Waste" },
  { value: "demand", label: "Demand" },
] as const;

export const ITEM_OPTIONS = [
  { value: "all", label: "All items" },
  { value: "milk", label: "Milk" },
  { value: "bread", label: "Bread" },
  { value: "apples", label: "Apples" },
  { value: "carrots", label: "Carrots" },
] as const;

export function toPredictionsFilters(
  input: PredictionsFiltersInput,
): PredictionsFilters {
  return {
    timeRange: input.timeRange,
    siteId: input.siteId,
    category: input.category,
    itemId: input.itemId,
    forecastType: input.forecastType,
  };
}

export const MOCK_TEAM_MEMBERS = [
  { id: "user_ops_1", name: "Jordan Lee", role: "Operations Manager" },
  { id: "user_coord_1", name: "Sam Rivera", role: "Donation Coordinator" },
  { id: "user_analyst_1", name: "Alex Chen", role: "Analyst" },
] as const;
