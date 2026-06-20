import type { SettingsSectionId } from "@/types/settings";
import {
  Building2,
  Users,
  Shield,
  Bot,
  TrendingUp,
  Plug,
  Palette,
  Bell,
  Database,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface SettingsSectionConfig {
  id: SettingsSectionId;
  label: string;
  description: string;
  icon: LucideIcon;
}

export const SETTINGS_SECTIONS: SettingsSectionConfig[] = [
  {
    id: "organization",
    label: "Organization",
    description: "Profile and operational details",
    icon: Building2,
  },
  {
    id: "users",
    label: "Users",
    description: "Team members and invitations",
    icon: Users,
  },
  {
    id: "permissions",
    label: "Permissions",
    description: "Roles and access control",
    icon: Shield,
  },
  {
    id: "ai",
    label: "AI Settings",
    description: "Intelligence and assistant behavior",
    icon: Bot,
  },
  {
    id: "forecasting",
    label: "Forecasting",
    description: "Prediction horizon and data sources",
    icon: TrendingUp,
  },
  {
    id: "integrations",
    label: "Integrations",
    description: "Connected data sources",
    icon: Plug,
  },
  {
    id: "appearance",
    label: "Appearance",
    description: "Theme, layout, and display",
    icon: Palette,
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Alert preferences",
    icon: Bell,
  },
  {
    id: "data",
    label: "Data Management",
    description: "Retention and exports",
    icon: Database,
  },
];

export const VALID_SETTINGS_SECTIONS: SettingsSectionId[] =
  SETTINGS_SECTIONS.map((s) => s.id);

export const DEFAULT_SETTINGS_SECTION: SettingsSectionId = "organization";
