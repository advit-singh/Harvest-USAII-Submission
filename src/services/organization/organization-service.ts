import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import {
  organization_members,
  organization_settings,
  organization_sites,
  organizations,
  permissions,
  role_permissions,
  roles,
} from "@/db/schema";
import { recordAuditLog } from "@/services/platform/audit-service";
import { buildDefaultSettingsJson } from "@/services/platform/default-settings";
import {
  ALL_PERMISSION_CATALOG,
  SYSTEM_ROLE_DEFINITIONS,
} from "@/services/platform/system-roles";
import type { CreateOrganizationInput, Organization } from "@/types/organization";
import { mapCreateOrganizationInput, mapOrganization } from "./organization-mappers";

export interface CreateOrganizationResult {
  organization: Organization;
  siteId: string;
  adminRoleId: string;
}

export async function listOrganizationsForUser(userId: string): Promise<Organization[]> {
  const memberships = await db
    .select({ org: organizations })
    .from(organization_members)
    .innerJoin(organizations, eq(organization_members.organization_id, organizations.id))
    .where(eq(organization_members.user_id, userId));

  return memberships
    .filter((row) => row.org.is_active)
    .map((row) => mapOrganization(row.org));
}

export async function createOrganization(
  input: CreateOrganizationInput,
  userId: string,
): Promise<CreateOrganizationResult> {
  return db.transaction(async (tx) => {
    await ensurePermissionCatalog(tx);

    const orgValues = mapCreateOrganizationInput(input);
    const [org] = await tx
      .insert(organizations)
      .values({
        ...orgValues,
        is_active: true,
        created_by: userId,
      })
      .returning();

    const [site] = await tx
      .insert(organization_sites)
      .values({
        organization_id: org!.id,
        name: "Main Kitchen",
        site_type: "kitchen",
        is_active: true,
        created_by: userId,
      })
      .returning();

    const permissionMap = await loadPermissionKeyMap(tx);
    const roleIds = new Map<string, string>();
    let adminRoleId = "";

    for (const definition of SYSTEM_ROLE_DEFINITIONS) {
      const [role] = await tx
        .insert(roles)
        .values({
          organization_id: org!.id,
          name: definition.name,
          description: definition.description,
          is_system_role: true,
          created_by: userId,
        })
        .returning();

      roleIds.set(definition.slug, role!.id);
      if (definition.slug === "admin") {
        adminRoleId = role!.id;
      }

      for (const permissionKey of definition.permissionIds) {
        const permissionId = permissionMap.get(permissionKey);
        if (permissionId) {
          await tx.insert(role_permissions).values({
            role_id: role!.id,
            permission_id: permissionId,
            created_by: userId,
          });
        }
      }
    }

    await tx.insert(organization_members).values({
      organization_id: org!.id,
      user_id: userId,
      role_id: adminRoleId,
      status: "active",
      created_by: userId,
    });

    const defaultSettings = buildDefaultSettingsJson(org!.id);
    await tx.insert(organization_settings).values({
      organization_id: org!.id,
      settings_json: defaultSettings,
      created_by: userId,
    });

    await recordAuditLog({
      organizationId: org!.id,
      userId,
      entityType: "organization",
      entityId: org!.id,
      action: "created",
      newValue: { name: org!.name },
    });

    return {
      organization: mapOrganization(org!),
      siteId: site!.id,
      adminRoleId,
    };
  });
}

export async function getOrganizationById(
  organizationId: string,
  userId: string,
): Promise<Organization | null> {
  const membership = await db.query.organization_members.findFirst({
    where: (fields, { and: andFn, eq: eqFn }) =>
      andFn(
        eqFn(fields.organization_id, organizationId),
        eqFn(fields.user_id, userId),
        eqFn(fields.status, "active"),
      ),
  });
  if (!membership) return null;

  const org = await db.query.organizations.findFirst({
    where: (fields, { eq: eqFn }) => eqFn(fields.id, organizationId),
  });
  return org ? mapOrganization(org) : null;
}

async function ensurePermissionCatalog(tx: Pick<typeof db, "insert">) {
  for (const perm of ALL_PERMISSION_CATALOG) {
    await tx
      .insert(permissions)
      .values({
        key: perm.key,
        name: perm.name,
        description: perm.description,
      })
      .onConflictDoNothing();
  }
}

async function loadPermissionKeyMap(tx: Pick<typeof db, "select">) {
  const rows = await tx.select().from(permissions);
  return new Map(rows.map((row) => [row.key, row.id]));
}
