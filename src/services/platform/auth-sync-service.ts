import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { DEMO_USER_ID } from "./constants";

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
}

export async function ensureUserFromAuth(authUser: AuthUser) {
  const existing = await db.query.users.findFirst({
    where: (fields, { eq: eqFn }) => eqFn(fields.id, authUser.id),
  });

  const nameParts = authUser.fullName?.trim().split(/\s+/) ?? [];
  const firstName = nameParts[0] ?? null;
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : null;

  if (existing) {
    if (
      existing.email !== authUser.email ||
      existing.first_name !== firstName ||
      existing.last_name !== lastName ||
      existing.avatar_url !== (authUser.avatarUrl ?? null)
    ) {
      const [updated] = await db
        .update(users)
        .set({
          email: authUser.email,
          first_name: firstName,
          last_name: lastName,
          avatar_url: authUser.avatarUrl ?? null,
          updated_at: new Date(),
        })
        .where(eq(users.id, authUser.id))
        .returning();
      return updated!;
    }
    return existing;
  }

  const [created] = await db
    .insert(users)
    .values({
      id: authUser.id,
      email: authUser.email,
      first_name: firstName,
      last_name: lastName,
      avatar_url: authUser.avatarUrl ?? null,
      is_active: true,
    })
    .returning();

  return created!;
}

export async function ensureDemoUser() {
  return ensureUserFromAuth({
    id: DEMO_USER_ID,
    email: "demo@harvest.local",
    fullName: "Demo User",
  });
}
