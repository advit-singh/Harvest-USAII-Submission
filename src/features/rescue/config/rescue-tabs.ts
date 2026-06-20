import type { RescueTabId } from "@/types/rescue";
import type { RescueFiltersInput } from "@/features/rescue/schemas/rescue-filters.schema";
import type { RescueFilters } from "@/types/rescue";
import {
  HeartHandshake,
  Users,
  History,
  Leaf,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface RescueTabConfig {
  id: RescueTabId;
  label: string;
  description: string;
  icon: LucideIcon;
}

export const RESCUE_TABS: RescueTabConfig[] = [
  {
    id: "opportunities",
    label: "Opportunities",
    description: "Review surplus donation opportunities",
    icon: HeartHandshake,
  },
  {
    id: "recipients",
    label: "Recipients",
    description: "Manage recipient organizations",
    icon: Users,
  },
  {
    id: "history",
    label: "History",
    description: "Track completed donations",
    icon: History,
  },
  {
    id: "impact",
    label: "Impact",
    description: "Measure rescue outcomes",
    icon: Leaf,
  },
];

export const VALID_RESCUE_TABS: RescueTabId[] = RESCUE_TABS.map((t) => t.id);

export function toRescueFilters(input: RescueFiltersInput): RescueFilters {
  return {
    priority: input.priority,
    siteId: input.siteId,
    expirationWindow: input.expirationWindow,
    search: input.search.trim().toLowerCase(),
  };
}

export function filterOpportunities<
  T extends {
    item: string;
    priority: string;
    siteId?: string;
    siteName: string;
    expirationDate: string;
  },
>(items: T[], filters: RescueFilters): T[] {
  const now = Date.now();
  return items.filter((item) => {
    if (filters.priority !== "all" && item.priority !== filters.priority) {
      return false;
    }
    if (
      filters.siteId !== "all" &&
      item.siteId !== filters.siteId &&
      item.siteName !== filters.siteId
    ) {
      return false;
    }
    if (filters.search) {
      const haystack = `${item.item} ${item.siteName}`.toLowerCase();
      if (!haystack.includes(filters.search)) return false;
    }
    if (filters.expirationWindow !== "all") {
      const expires = new Date(item.expirationDate).getTime();
      const windowMs =
        filters.expirationWindow === "48h"
          ? 48 * 60 * 60 * 1000
          : 7 * 24 * 60 * 60 * 1000;
      if (expires - now > windowMs) return false;
    }
    return true;
  });
}
