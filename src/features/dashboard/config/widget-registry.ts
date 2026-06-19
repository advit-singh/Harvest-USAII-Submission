import type { ComponentType } from "react";
import {
  Activity,
  AlertTriangle,
  HeartHandshake,
  Leaf,
  Package,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import type { WidgetId } from "@/types/dashboard";
import { DEFAULT_LAYOUTS, DEFAULT_VISIBILITY } from "@/store/dashboard-store";

export interface WidgetDefinition {
  id: WidgetId;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  defaultLayout: (typeof DEFAULT_LAYOUTS)[number];
}

export const WIDGET_REGISTRY: WidgetDefinition[] = [
  {
    id: "waste-risk",
    title: "Waste Risk",
    description: "Current risk level and primary drivers",
    icon: AlertTriangle,
    defaultLayout: DEFAULT_LAYOUTS[0],
  },
  {
    id: "predicted-surplus",
    title: "Predicted Surplus",
    description: "Forecast summary for upcoming surplus",
    icon: TrendingUp,
    defaultLayout: DEFAULT_LAYOUTS[1],
  },
  {
    id: "impact-snapshot",
    title: "Impact Snapshot",
    description: "Meals saved, food diverted, and CO₂ avoided",
    icon: Leaf,
    defaultLayout: DEFAULT_LAYOUTS[2],
  },
  {
    id: "recommendations",
    title: "Recommendations",
    description: "Top priority actions to take now",
    icon: Sparkles,
    defaultLayout: DEFAULT_LAYOUTS[3],
  },
  {
    id: "inventory-health",
    title: "Inventory Health",
    description: "Expiring items and storage utilization",
    icon: Package,
    defaultLayout: DEFAULT_LAYOUTS[4],
  },
  {
    id: "donation-opportunities",
    title: "Donation Opportunities",
    description: "Highest-priority surplus for rescue",
    icon: HeartHandshake,
    defaultLayout: DEFAULT_LAYOUTS[5],
  },
  {
    id: "recent-activity",
    title: "Recent Activity",
    description: "Latest uploads, forecasts, and actions",
    icon: Activity,
    defaultLayout: DEFAULT_LAYOUTS[6],
  },
];

export const WIDGET_IDS = WIDGET_REGISTRY.map((w) => w.id);

export function getWidgetDefinition(id: WidgetId): WidgetDefinition | undefined {
  return WIDGET_REGISTRY.find((w) => w.id === id);
}

export { DEFAULT_VISIBILITY };
