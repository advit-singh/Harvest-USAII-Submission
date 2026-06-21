import { apiClient } from "@/lib/api/client";
import { isMockApiEnabled } from "@/lib/api/api-mode";
import type { OrganizationSite } from "@/types/organization";

const MOCK_SITES: OrganizationSite[] = [
  {
    id: "site_001",
    organizationId: "org_demo",
    name: "Lincoln Elementary Cafeteria",
    siteType: "kitchen",
    isActive: true,
  },
  {
    id: "site_002",
    organizationId: "org_demo",
    name: "Lincoln Middle Cafeteria",
    siteType: "kitchen",
    isActive: true,
  },
];

export async function fetchOrgSites(orgId: string): Promise<OrganizationSite[]> {
  if (isMockApiEnabled()) {
    return MOCK_SITES.map((s) => ({ ...s, organizationId: orgId }));
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
