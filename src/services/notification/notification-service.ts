import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { notifications, system_events } from "@/db/schema";
import { getNotificationPreferences } from "@/services/organization/settings-service";
import type { HarvestNotification, NotificationType } from "@/types/notification";
import { mapNotificationRow } from "./notification-mappers";

export interface NotificationListFilters {
  organizationId: string;
  userId: string;
  limit?: number;
}

export interface EmitNotificationInput {
  organizationId: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  href?: string;
  createdBy?: string;
}

function filterByPreferences(
  items: HarvestNotification[],
  preferences: Awaited<ReturnType<typeof getNotificationPreferences>>,
): HarvestNotification[] {
  return items.filter((item) => {
    if (item.severity === "critical" && !preferences.critical) return false;
    if (item.severity === "warning" && !preferences.warning) return false;
    if (item.severity === "informational" && !preferences.informational) return false;
    return true;
  });
}

export async function listNotifications(
  filters: NotificationListFilters,
): Promise<HarvestNotification[]> {
  const rows = await db
    .select()
    .from(notifications)
    .where(
      and(
        eq(notifications.organization_id, filters.organizationId),
        eq(notifications.user_id, filters.userId),
      ),
    )
    .orderBy(desc(notifications.created_at))
    .limit(filters.limit ?? 50);

  const mapped = rows.map(mapNotificationRow);
  const preferences = await getNotificationPreferences(filters.organizationId);
  const filtered = filterByPreferences(mapped, preferences);
  return filters.limit ? filtered.slice(0, filters.limit) : filtered;
}

export async function markNotificationRead(
  notificationId: string,
  userId: string,
): Promise<{ id: string; isRead: boolean } | null> {
  const [row] = await db
    .update(notifications)
    .set({ is_read: true, updated_at: new Date() })
    .where(and(eq(notifications.id, notificationId), eq(notifications.user_id, userId)))
    .returning();

  if (!row) return null;
  return { id: row.id, isRead: true };
}

export async function markAllNotificationsRead(
  organizationId: string,
  userId: string,
): Promise<{ updatedCount: number }> {
  const items = await listNotifications({
    organizationId,
    userId,
    limit: 200,
  });
  const unreadIds = items.filter((item) => !item.isRead).map((item) => item.id);
  if (unreadIds.length === 0) {
    return { updatedCount: 0 };
  }

  let updatedCount = 0;
  for (const id of unreadIds) {
    const result = await markNotificationRead(id, userId);
    if (result) updatedCount += 1;
  }

  return { updatedCount };
}

export async function emitNotification(input: EmitNotificationInput): Promise<HarvestNotification> {
  const [row] = await db
    .insert(notifications)
    .values({
      organization_id: input.organizationId,
      user_id: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      metadata: input.href ? { href: input.href } : null,
      created_by: input.createdBy ?? input.userId,
    })
    .returning();

  await db.insert(system_events).values({
    organization_id: input.organizationId,
    event_type: input.type,
    payload: {
      notificationId: row!.id,
      title: input.title,
      href: input.href,
    },
    created_by: input.createdBy ?? input.userId,
  });

  return mapNotificationRow(row!);
}
