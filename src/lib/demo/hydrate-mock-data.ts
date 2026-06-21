import {
  loadMockOrganizations,
  loadMockSettingsMap,
  loadMockSites,
  saveMockOrganizations,
  saveMockSites,
} from "@/lib/demo/mock-persistence";
import {
  getMockOrganizations,
  setMockOrganizationsState,
} from "@/lib/api/organizations";
import {
  getMockSitesState,
  setMockSitesState,
} from "@/lib/api/sites";
import {
  hydrateMockSettingsFromStorage,
} from "@/lib/mocks/settings-fixtures";
import type { Organization, OrganizationSite } from "@/types/organization";

let hydrated = false;

export function hydrateMockData(): void {
  if (typeof window === "undefined" || hydrated) return;
  hydrated = true;

  const orgs = loadMockOrganizations<Organization>();
  if (orgs.length > 0) {
    setMockOrganizationsState(orgs);
  }

  const sites = loadMockSites<OrganizationSite>();
  if (sites.length > 0) {
    setMockSitesState(sites);
  }

  const settingsMap = loadMockSettingsMap();
  if (Object.keys(settingsMap).length > 0) {
    hydrateMockSettingsFromStorage(settingsMap);
  }
}

export function persistMockData(): void {
  if (typeof window === "undefined") return;
  saveMockOrganizations(getMockOrganizations());
  saveMockSites(getMockSitesState());
}
