import { getMockOrganizations } from "@/lib/api/organizations";
import { getMockSitesForOrg } from "@/lib/api/sites";
import { getOrgMeta } from "@/lib/demo/mock-persistence";
import { DEMO_ORGANIZATIONS } from "@/lib/demo/bootstrap";

export interface OrgContext {
  orgId: string;
  orgName: string;
  city: string;
  state: string;
  country: string;
  timezone: string;
  primarySiteId: string;
  primarySiteName: string;
  siteNames: string[];
  operationalFocus?: string;
}

const FALLBACK_SITE = "Main Kitchen";

function resolveOrg(orgId: string) {
  const orgs = getMockOrganizations();
  const fromMock = orgs.find((o) => o.id === orgId);
  if (fromMock) return fromMock;

  const demo = DEMO_ORGANIZATIONS.find((o) => o.id === orgId);
  if (demo) return demo;

  return {
    id: orgId,
    name: "Your Organization",
    type: "school" as const,
    timezone: "America/Chicago",
    country: "US",
    state: "",
    city: "",
    defaultUnitSystem: "imperial" as const,
    isActive: true,
  };
}

export function getOrgContext(orgId: string): OrgContext {
  const org = resolveOrg(orgId);
  const sites = getMockSitesForOrg(orgId);
  const meta = getOrgMeta(orgId);

  const primarySite = sites[0];
  const primarySiteName =
    primarySite?.name ?? `${org.name} — ${FALLBACK_SITE}`;

  return {
    orgId,
    orgName: org.name,
    city: org.city ?? "",
    state: org.state ?? "",
    country: org.country ?? "US",
    timezone: org.timezone,
    primarySiteId: primarySite?.id ?? `site_${orgId}`,
    primarySiteName,
    siteNames: sites.length > 0 ? sites.map((s) => s.name) : [primarySiteName],
    operationalFocus: meta.operationalFocus,
  };
}

export function orgScale(orgId: string): number {
  if (orgId === "org_demo_456") return 1.4;
  if (orgId === "org_demo_789") return 2.1;
  return 1;
}
