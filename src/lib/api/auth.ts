import { cookies } from "next/headers";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { db } from "@/db/client";
import { DEMO_USER_ID } from "@/services/platform/constants";
import { ensureDemoUser, ensureUserFromAuth } from "@/services/platform/auth-sync-service";

export async function getAuthenticatedUser() {
  if (!isSupabaseConfigured()) {
    const cookieStore = await cookies();
    if (cookieStore.get("harvest-dev-auth")?.value === "1") {
      await ensureDemoUser();
      return {
        id: DEMO_USER_ID,
        email: "demo@harvest.local",
        user_metadata: { full_name: "Demo User" },
      };
    }
    return null;
  }

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

  const metadata = user.user_metadata as Record<string, unknown> | undefined;

  await ensureUserFromAuth({
    id: user.id,
    email: user.email ?? `${user.id}@harvest.local`,
    fullName: typeof metadata?.full_name === "string" ? metadata.full_name : undefined,
    avatarUrl: typeof metadata?.avatar_url === "string" ? metadata.avatar_url : undefined,
  });

  return user;
}

export async function requireOrgMembership(organizationId: string, userId: string) {
  const member = await db.query.organization_members.findFirst({
    where: (fields, { and: andFn, eq: eqFn }) =>
      andFn(eqFn(fields.organization_id, organizationId), eqFn(fields.user_id, userId)),
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
