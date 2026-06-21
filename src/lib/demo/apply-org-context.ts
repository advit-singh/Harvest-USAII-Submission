import { getOrgContext, type OrgContext } from "@/lib/demo/org-context";

export function patchSiteFields<T extends { siteId?: string; siteName?: string }>(
  orgId: string,
  item: T,
): T {
  const ctx = getOrgContext(orgId);
  return {
    ...item,
    siteId: ctx.primarySiteId,
    siteName: ctx.primarySiteName,
  };
}

export function patchSiteFieldsList<T extends { siteId?: string; siteName?: string }>(
  orgId: string,
  items: T[],
): T[] {
  return items.map((item) => patchSiteFields(orgId, item));
}

export function buildHierarchyNodes(ctx: OrgContext) {
  return [
    { id: "org_001", name: ctx.orgName, level: "organization" as const, parentId: null },
    { id: "region_001", name: "Operations Region", level: "region" as const, parentId: "org_001" },
    { id: "campus_001", name: ctx.city || ctx.orgName, level: "campus" as const, parentId: "region_001" },
    { id: "building_001", name: "Main Building", level: "building" as const, parentId: "campus_001" },
    { id: "kitchen_001", name: ctx.primarySiteName, level: "kitchen" as const, parentId: "building_001" },
    { id: "storage_001", name: "Cold Storage A", level: "storage" as const, parentId: "kitchen_001" },
  ];
}
