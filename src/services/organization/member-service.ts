import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { organization_members, roles, users } from "@/db/schema";
import { recordAuditLog } from "@/services/platform/audit-service";
import type { OrganizationMember } from "@/types/organization";

export async function listMembers(organizationId: string): Promise<OrganizationMember[]> {
  const rows = await db
    .select({
      member: organization_members,
      user: users,
      role: roles,
    })
    .from(organization_members)
    .innerJoin(users, eq(organization_members.user_id, users.id))
    .innerJoin(roles, eq(organization_members.role_id, roles.id))
    .where(eq(organization_members.organization_id, organizationId));

  return rows.map((row) => ({
    id: row.member.id,
    email: row.user.email,
    roleId: row.role.id,
    roleName: row.role.name,
    organizationId,
  }));
}

export async function inviteMember(
  organizationId: string,
  email: string,
  roleId: string,
  invitedBy: string,
): Promise<OrganizationMember> {
  const role = await db.query.roles.findFirst({
    where: (fields, { and: andFn, eq: eqFn }) =>
      andFn(eqFn(fields.id, roleId), eqFn(fields.organization_id, organizationId)),
  });
  if (!role) {
    throw new Error("ROLE_NOT_FOUND");
  }

  let user = await db.query.users.findFirst({
    where: (fields, { eq: eqFn }) => eqFn(fields.email, email.toLowerCase()),
  });

  if (!user) {
    const [created] = await db
      .insert(users)
      .values({
        email: email.toLowerCase(),
        is_active: true,
        created_by: invitedBy,
      })
      .returning();
    user = created!;
  }

  const existing = await db.query.organization_members.findFirst({
    where: (fields, { and: andFn, eq: eqFn }) =>
      andFn(
        eqFn(fields.organization_id, organizationId),
        eqFn(fields.user_id, user!.id),
      ),
  });

  if (existing) {
    if (existing.status === "active") {
      throw new Error("MEMBER_EXISTS");
    }
    const [reactivated] = await db
      .update(organization_members)
      .set({
        role_id: roleId,
        status: "active",
        updated_at: new Date(),
      })
      .where(eq(organization_members.id, existing.id))
      .returning();

    await recordAuditLog({
      organizationId,
      userId: invitedBy,
      entityType: "organization_member",
      entityId: reactivated!.id,
      action: "reactivated",
      newValue: { email, roleId },
    });

    return {
      id: reactivated!.id,
      email: user!.email,
      roleId,
      roleName: role.name,
      organizationId,
    };
  }

  const [member] = await db
    .insert(organization_members)
    .values({
      organization_id: organizationId,
      user_id: user!.id,
      role_id: roleId,
      status: "active",
      created_by: invitedBy,
    })
    .returning();

  await recordAuditLog({
    organizationId,
    userId: invitedBy,
    entityType: "organization_member",
    entityId: member!.id,
    action: "invited",
    newValue: { email, roleId },
  });

  return {
    id: member!.id,
    email: user!.email,
    roleId,
    roleName: role.name,
    organizationId,
  };
}

export async function removeMember(
  organizationId: string,
  memberId: string,
  removedBy: string,
): Promise<void> {
  const member = await db.query.organization_members.findFirst({
    where: (fields, { and: andFn, eq: eqFn }) =>
      andFn(eqFn(fields.id, memberId), eqFn(fields.organization_id, organizationId)),
  });

  if (!member) {
    throw new Error("MEMBER_NOT_FOUND");
  }

  await db
    .update(organization_members)
    .set({ status: "inactive", updated_at: new Date() })
    .where(
      and(
        eq(organization_members.id, memberId),
        eq(organization_members.organization_id, organizationId),
      ),
    );

  await recordAuditLog({
    organizationId,
    userId: removedBy,
    entityType: "organization_member",
    entityId: memberId,
    action: "removed",
  });
}
