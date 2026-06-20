import type { AnalyticsFilters, AnalyticsTabId } from "@/types/analytics";
import type { AnalyticsFiltersInput } from "@/features/analytics/schemas/analytics-filters.schema";
import {
  BarChart3,
  Leaf,
  Package,
  Users,
  Heart,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface AnalyticsTabConfig {
  id: AnalyticsTabId;
  label: string;
  description: string;
  icon: LucideIcon;
}

export const ANALYTICS_TABS: AnalyticsTabConfig[] = [
  {
    id: "waste",
    label: "Waste",
    description: "Waste over time and breakdowns",
    icon: BarChart3,
  },
  {
    id: "inventory",
    label: "Inventory",
    description: "Inventory trends and utilization",
    icon: Package,
  },
  {
    id: "attendance",
    label: "Attendance",
    description: "Attendance patterns and forecast accuracy",
    icon: Users,
  },
  {
    id: "donations",
    label: "Donations",
    description: "Donation history and recipient performance",
    icon: Heart,
  },
  {
    id: "impact",
    label: "Impact",
    description: "Environmental, financial, and community impact",
    icon: Leaf,
  },
];

export const TIME_RANGE_OPTIONS: { value: AnalyticsFilters["timeRange"]; label: string }[] = [
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "quarter", label: "This quarter" },
  { value: "year", label: "This year" },
];

export const SITE_OPTIONS = [
  { value: "all", label: "All sites" },
  { value: "site_001", label: "Lincoln Elementary Cafeteria" },
  { value: "site_002", label: "Lincoln Middle Cafeteria" },
];

export function toAnalyticsFilters(input: AnalyticsFiltersInput): AnalyticsFilters {
  return {
    timeRange: input.timeRange,
    siteId: input.siteId,
    hierarchyLevel: input.hierarchyLevel,
    hierarchyId: input.hierarchyId,
    category: input.category,
    eventId: input.eventId,
  };
}
