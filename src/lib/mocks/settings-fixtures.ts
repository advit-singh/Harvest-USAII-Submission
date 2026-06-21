import type { OrganizationSettings } from "@/types/settings";
import { DEFAULT_LAYOUTS, DEFAULT_VISIBILITY } from "@/store/dashboard-store";

const mockSettingsByOrg = new Map<string, OrganizationSettings>();

export function createDefaultOrganizationSettings(
  organizationId: string,
): OrganizationSettings {
  return {
    organizationId,
    ai: {
      confidenceVisibility: true,
      memoryEnabled: true,
      recommendationAggressiveness: "medium",
      assistantEnabled: true,
      autoCommitEnabled: true,
      autoCommitConfidenceThreshold: 0.85,
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
    dashboardLayout: {
      layouts: DEFAULT_LAYOUTS,
      visibility: { ...DEFAULT_VISIBILITY },
      updatedAt: new Date().toISOString(),
    },
    updatedAt: new Date().toISOString(),
  };
}

export function getMockOrganizationSettings(
  organizationId: string,
): OrganizationSettings {
  const existing = mockSettingsByOrg.get(organizationId);
  if (existing) return existing;

  const defaults = createDefaultOrganizationSettings(organizationId);
  mockSettingsByOrg.set(organizationId, defaults);
  return defaults;
}

export function setMockOrganizationSettings(
  organizationId: string,
  settings: OrganizationSettings,
): void {
  mockSettingsByOrg.set(organizationId, settings);
}

export function resetMockOrganizationSettings(): void {
  mockSettingsByOrg.clear();
}
