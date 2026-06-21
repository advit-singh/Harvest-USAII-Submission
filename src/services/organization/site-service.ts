import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { organization_sites } from "@/db/schema";
import type { OrganizationSite } from "@/types/organization";

export async function listSitesForOrg(organizationId: string): Promise<OrganizationSite[]> {
  const rows = await db
    .select()
    .from(organization_sites)
    .where(eq(organization_sites.organization_id, organizationId))
    .orderBy(asc(organization_sites.name));

  return rows
    .filter((row) => row.is_active)
    .map((row) => ({
      id: row.id,
      organizationId: row.organization_id,
      name: row.name,
      siteType: row.site_type,
      isActive: row.is_active,
    }));
}
