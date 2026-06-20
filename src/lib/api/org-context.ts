import { db } from "@/db/client";
import { organization_sites } from "@/db/schema";

export async function getDefaultOrgContext(userId: string) {
  const membership = await db.query.organization_members.findFirst({
    where: (fields, { eq: eqFn }) =>
      eqFn(fields.user_id, userId),
  });

  if (!membership || membership.status !== "active") {
    return null;
  }

  const site = await db.query.organization_sites.findFirst({
    where: (fields, { eq: eqFn }) =>
      eqFn(fields.organization_id, membership.organization_id),
  });

  return {
    organizationId: membership.organization_id,
    siteId: site?.id ?? null,
  };
}

export async function getDefaultSiteForOrg(organizationId: string) {
  const site = await db.query.organization_sites.findFirst({
    where: (fields, { eq: eqFn }) => eqFn(fields.organization_id, organizationId),
  });
  return site?.id ?? null;
}
