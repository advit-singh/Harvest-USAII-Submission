import { eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { permissions, role_permissions, roles } from "@/db/schema";
import { getDefaultOrgContext } from "@/lib/api/org-context";
import { recordAuditLog } from "@/services/platform/audit-service";
import { ALL_PERMISSION_CATALOG } from "@/services/platform/system-roles";
import type { Role } from "@/types/organization";
import type { PermissionId, RoleWithPermissions } from "@/types/settings";

export async function resolveOrganizationIdForRoles(
  userId: string,
  organizationId?: string | null,
): Promise<string> {
  if (organizationId) return organizationId;
  const context = await getDefaultOrgContext(userId);
  if (!context?.organizationId) {
    throw new Error("ORGANIZATION_REQUIRED");
  }
  return context.organizationId;
}

export async function listRoles(
  organizationId: string,
  includePermissions = false,
): Promise<Role[] | RoleWithPermissions[]> {
  const roleRows = await db
    .select()
    .from(roles)
    .where(eq(roles.organization_id, organizationId))
    .orderBy(roles.name);

  if (!includePermissions) {
    return roleRows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description ?? undefined,
    }));
  }

  const permissionRows = await db
    .select({
      roleId: role_permissions.role_id,
      permissionKey: permissions.key,
    })
    .from(role_permissions)
    .innerJoin(permissions, eq(role_permissions.permission_id, permissions.id));

  const permissionsByRole = new Map<string, PermissionId[]>();
  for (const row of permissionRows) {
    const existing = permissionsByRole.get(row.roleId) ?? [];
    existing.push(row.permissionKey as PermissionId);
    permissionsByRole.set(row.roleId, existing);
  }

  return roleRows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    permissionIds: permissionsByRole.get(row.id) ?? [],
    isSystem: row.is_system_role,
  }));
}

export async function createCustomRole(
  organizationId: string,
  input: { name: string; description?: string; permissionIds: PermissionId[] },
  createdBy: string,
): Promise<RoleWithPermissions> {
  const [role] = await db
    .insert(roles)
    .values({
      organization_id: organizationId,
      name: input.name,
      description: input.description ?? null,
      is_system_role: false,
      created_by: createdBy,
    })
    .returning();

  const permissionRows = await db
    .select()
    .from(permissions)
    .where(inArray(permissions.key, input.permissionIds));

  if (permissionRows.length !== input.permissionIds.length) {
    throw new Error("INVALID_PERMISSION");
  }

  for (const permission of permissionRows) {
    await db.insert(role_permissions).values({
      role_id: role!.id,
      permission_id: permission.id,
      created_by: createdBy,
    });
  }

  await recordAuditLog({
    organizationId,
    userId: createdBy,
    entityType: "role",
    entityId: role!.id,
    action: "created",
    newValue: { name: input.name, permissionIds: input.permissionIds },
  });

  return {
    id: role!.id,
    name: role!.name,
    description: role!.description ?? undefined,
    permissionIds: input.permissionIds,
    isSystem: false,
  };
}

export async function ensurePermissionCatalogSeeded() {
  for (const perm of ALL_PERMISSION_CATALOG) {
    await db
      .insert(permissions)
      .values({
        key: perm.key,
        name: perm.name,
        description: perm.description,
      })
      .onConflictDoNothing();
  }
}
