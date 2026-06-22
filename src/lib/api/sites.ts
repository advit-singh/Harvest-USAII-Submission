import { apiClient } from "@/lib/api/client";
import { isMockApiEnabled } from "@/lib/api/api-mode";
import { persistMockData } from "@/lib/demo/hydrate-mock-data";
import type { OrganizationSite } from "@/types/organization";

let mockSites: OrganizationSite[] = [];

const DEMO_SITES_BY_ORG: Record<string, OrganizationSite[]> = {
  org_demo_123: [
    {
      id: "site_001",
      organizationId: "org_demo_123",
      name: "Lincoln Elementary Cafeteria",
      siteType: "kitchen",
      isActive: true,
    },
    {
      id: "site_002",
      organizationId: "org_demo_123",
      name: "Lincoln Middle Cafeteria",
      siteType: "kitchen",
      isActive: true,
    },
  ],
  org_demo_456: [
    {
      id: "site_456_001",
      organizationId: "org_demo_456",
      name: "Riverside Main Kitchen",
      siteType: "kitchen",
      isActive: true,
    },
  ],
  org_demo_789: [
    {
      id: "site_789_001",
      organizationId: "org_demo_789",
      name: "Metro University Dining Hall",
      siteType: "kitchen",
      isActive: true,
    },
  ],
};

export function getMockSitesState(): OrganizationSite[] {
  return mockSites;
}

export function setMockSitesState(sites: OrganizationSite[]): void {
  mockSites = sites;
}

export function getMockSitesForOrg(orgId: string): OrganizationSite[] {
  const userSites = mockSites.filter((s) => s.organizationId === orgId);
  if (userSites.length > 0) return userSites;
  return DEMO_SITES_BY_ORG[orgId] ?? [];
}

export function createMockSite(input: {
  organizationId: string;
  name: string;
  siteType?: string;
}): OrganizationSite {
  const site: OrganizationSite = {
    id: `site_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    organizationId: input.organizationId,
    name: input.name,
    siteType: input.siteType ?? "kitchen",
    isActive: true,
  };
  mockSites = [...mockSites, site];
  persistMockData();
  return site;
}

export async function fetchOrgSites(orgId: string): Promise<OrganizationSite[]> {
  if (isMockApiEnabled()) {
    return getMockSitesForOrg(orgId);
  }
  return apiClient<OrganizationSite[]>(`/organizations/${orgId}/sites`);
}

export function toSiteOptions(sites: OrganizationSite[]) {
  return [
    { value: "all", label: "All sites" },
    ...sites.map((s) => ({ value: s.id, label: s.name })),
  ];
}

export function getDefaultSiteId(sites: OrganizationSite[]): string {
  return sites[0]?.id ?? "";
}
