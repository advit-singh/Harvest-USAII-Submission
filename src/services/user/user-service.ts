import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import type { UpdateUserProfileInput, UserProfile } from "@/types/user";

function mapUserProfile(row: typeof users.$inferSelect): UserProfile {
  const fullName = [row.first_name, row.last_name].filter(Boolean).join(" ").trim();
  return {
    id: row.id,
    email: row.email,
    fullName: fullName || undefined,
    avatarUrl: row.avatar_url ?? undefined,
  };
}

export async function getCurrentUserProfile(userId: string): Promise<UserProfile | null> {
  const row = await db.query.users.findFirst({
    where: (fields, { eq: eqFn }) => eqFn(fields.id, userId),
  });
  return row ? mapUserProfile(row) : null;
}

export async function updateCurrentUserProfile(
  userId: string,
  input: UpdateUserProfileInput,
): Promise<UserProfile> {
  const nameParts = input.fullName?.trim().split(/\s+/) ?? [];
  const firstName = nameParts[0] ?? undefined;
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : undefined;

  const [row] = await db
    .update(users)
    .set({
      first_name: firstName ?? undefined,
      last_name: lastName ?? undefined,
      avatar_url: input.avatarUrl ?? undefined,
      updated_at: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  if (!row) {
    throw new Error("USER_NOT_FOUND");
  }

  return mapUserProfile(row);
}
