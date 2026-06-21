import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { permissions, role_permissions } from "@/db/schema";
import { AuthError } from "@/lib/api/auth";
import type { PermissionId } from "@/types/settings";

export async function userHasPermission(
  organizationId: string,
  userId: string,
  permissionKey: PermissionId,
): Promise<boolean> {
  const member = await db.query.organization_members.findFirst({
    where: (fields, { and: andFn, eq: eqFn }) =>
      andFn(
        eqFn(fields.organization_id, organizationId),
        eqFn(fields.user_id, userId),
        eqFn(fields.status, "active"),
      ),
  });

  if (!member) return false;

  const rows = await db
    .select({ key: permissions.key })
    .from(role_permissions)
    .innerJoin(permissions, eq(role_permissions.permission_id, permissions.id))
    .where(eq(role_permissions.role_id, member.role_id));

  return rows.some((row) => row.key === permissionKey);
}

export async function requirePermission(
  organizationId: string,
  userId: string,
  permissionKey: PermissionId,
): Promise<void> {
  const allowed = await userHasPermission(organizationId, userId, permissionKey);
  if (!allowed) {
    throw new AuthError("FORBIDDEN", `Missing required permission: ${permissionKey}`);
  }
}
