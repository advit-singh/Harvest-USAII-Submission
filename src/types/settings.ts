import type { DashboardLayoutState } from "@/types/dashboard";

export type RecommendationAggressiveness = "low" | "medium" | "high";

export interface AiSettings {
  confidenceVisibility: boolean;
  memoryEnabled: boolean;
  recommendationAggressiveness: RecommendationAggressiveness;
  assistantEnabled: boolean;
  autoCommitEnabled: boolean;
  autoCommitConfidenceThreshold: number;
}

export interface ForecastSettings {
  defaultHorizonDays: number;
  externalDataEnabled: boolean;
}

export interface NotificationPreferences {
  critical: boolean;
  warning: boolean;
  informational: boolean;
  emailDigest: boolean;
}

export interface OrganizationSettings {
  organizationId: string;
  ai: AiSettings;
  forecast: ForecastSettings;
  notifications: NotificationPreferences;
  dashboardLayout?: DashboardLayoutState | null;
  updatedAt: string;
}

export type OrganizationSettingsPatch = Partial<{
  ai: Partial<AiSettings>;
  forecast: Partial<ForecastSettings>;
  notifications: Partial<NotificationPreferences>;
  dashboardLayout: DashboardLayoutState | null;
}>;

export type PermissionId =
  | "org.manage"
  | "users.manage"
  | "uploads.manage"
  | "forecasts.view"
  | "forecasts.generate"
  | "recommendations.manage"
  | "donations.manage"
  | "reports.generate"
  | "assistant.use"
  | "settings.manage"
  | "analytics.view";

export interface Permission {
  id: PermissionId;
  label: string;
  description: string;
  group: string;
}

export interface PermissionGroup {
  id: string;
  label: string;
  permissions: Permission[];
}

export interface RoleWithPermissions {
  id: string;
  name: string;
  description?: string;
  permissionIds: PermissionId[];
  isSystem?: boolean;
}

export type SettingsSectionId =
  | "organization"
  | "users"
  | "permissions"
  | "ai"
  | "forecasting"
  | "integrations"
  | "appearance"
  | "notifications"
  | "data";
