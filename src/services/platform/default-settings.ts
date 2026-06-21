import type { OrganizationSettings } from "@/types/settings";

export function buildDefaultSettingsJson(organizationId: string): OrganizationSettings {
  return {
    organizationId,
    ai: {
      confidenceVisibility: true,
      memoryEnabled: true,
      recommendationAggressiveness: "medium",
      assistantEnabled: true,
    },
    forecast: {
      defaultHorizonDays: 7,
      externalDataEnabled: true,
    },
    notifications: {
      critical: true,
      warning: true,
      informational: true,
      emailDigest: false,
    },
    dashboardLayout: null,
    updatedAt: new Date().toISOString(),
  };
}
