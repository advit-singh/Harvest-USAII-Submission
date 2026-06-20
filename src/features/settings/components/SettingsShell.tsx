"use client";

import { EmptyOrgDashboard } from "@/features/organizations/components/EmptyOrgDashboard";
import { SettingsSectionNav } from "@/features/settings/components/SettingsSectionNav";
import { OrganizationSection } from "@/features/settings/components/sections/OrganizationSection";
import { UsersSection } from "@/features/settings/components/sections/UsersSection";
import { PermissionsSection } from "@/features/settings/components/sections/PermissionsSection";
import { AiSettingsSection } from "@/features/settings/components/sections/AiSettingsSection";
import { ForecastSettingsSection } from "@/features/settings/components/sections/ForecastSettingsSection";
import { IntegrationsSection } from "@/features/settings/components/sections/IntegrationsSection";
import { AppearanceSection } from "@/features/settings/components/sections/AppearanceSection";
import { NotificationsPreferencesSection } from "@/features/settings/components/sections/NotificationsPreferencesSection";
import { DataManagementSection } from "@/features/settings/components/sections/DataManagementSection";
import { useSettingsSection } from "@/features/settings/hooks/useSettingsSection";
import { DEFAULT_SETTINGS_SECTION } from "@/features/settings/config/settings-sections";
import type { SettingsSectionId } from "@/types/settings";
import { useOrganizations } from "@/features/organizations/hooks/useOrganizations";

interface SettingsShellProps {
  orgId: string | null;
}

function renderSection(section: SettingsSectionId, orgId: string) {
  switch (section) {
    case "organization":
      return <OrganizationSection orgId={orgId} />;
    case "users":
      return <UsersSection orgId={orgId} />;
    case "permissions":
      return <PermissionsSection orgId={orgId} />;
    case "ai":
      return <AiSettingsSection orgId={orgId} />;
    case "forecasting":
      return <ForecastSettingsSection orgId={orgId} />;
    case "integrations":
      return <IntegrationsSection orgId={orgId} />;
    case "appearance":
      return <AppearanceSection orgId={orgId} />;
    case "notifications":
      return <NotificationsPreferencesSection orgId={orgId} />;
    case "data":
      return <DataManagementSection orgId={orgId} />;
    default:
      return null;
  }
}

export function SettingsShell({ orgId }: SettingsShellProps) {
  const { activeOrg } = useOrganizations();
  const { activeSection, setActiveSection } = useSettingsSection();

  if (!orgId || !activeOrg) {
    return <EmptyOrgDashboard />;
  }

  const currentSection = activeSection ?? DEFAULT_SETTINGS_SECTION;

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <SettingsSectionNav
        activeSection={currentSection}
        onSectionChange={setActiveSection}
      />
      <div className="min-w-0 flex-1 max-w-3xl">
        {renderSection(currentSection, orgId)}
      </div>
    </div>
  );
}
