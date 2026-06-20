import { createClient } from "@/lib/supabase/server";
import { db } from "@/db/client";

export async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function requireAuthenticatedUser() {
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new AuthError("UNAUTHORIZED", "Authentication required.");
  }
  return user;
}

export async function requireOrgMembership(organizationId: string, userId: string) {
  const member = await db.query.organization_members.findFirst({
    where: (fields, { and, eq: eqFn }) =>
      and(eqFn(fields.organization_id, organizationId), eqFn(fields.user_id, userId)),
  });

  if (!member || member.status !== "active") {
    throw new AuthError("FORBIDDEN", "User is not a member of this organization.");
  }

  return member;
}

export class AuthError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "AuthError";
  }
}
