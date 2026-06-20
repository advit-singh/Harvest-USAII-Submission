import { isLiveIntelligenceApiEnabled } from "@/lib/api/api-mode";

/** Seeded database IDs from src/db/seeds/index.ts */
export const DEMO_DB_ORG_ID = "00000000-0000-4000-8000-000000000001";
export const DEMO_DB_SITE_ID = "00000000-0000-4000-8000-000000000002";

const MOCK_DEMO_ORG_PATTERN = /^org_(demo|new|empty)/;

export function resolveIntelligenceOrgId(orgId: string): string {
  if (!isLiveIntelligenceApiEnabled()) {
    return orgId;
  }
  if (MOCK_DEMO_ORG_PATTERN.test(orgId)) {
    return DEMO_DB_ORG_ID;
  }
  return orgId;
}

export function resolveIntelligenceSiteId(siteId: string | null | undefined): string {
  if (!isLiveIntelligenceApiEnabled()) {
    return siteId ?? "site_001";
  }
  if (!siteId || siteId === "all" || siteId === "site_001") {
    return DEMO_DB_SITE_ID;
  }
  return siteId;
}
