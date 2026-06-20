import { describe, expect, it, beforeEach } from "vitest";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  resetMockNotifications,
} from "@/lib/api/notifications";
import { resetMockOrganizationSettings } from "@/lib/mocks/settings-fixtures";

describe("notifications mock API", () => {
  beforeEach(() => {
    resetMockNotifications();
    resetMockOrganizationSettings();
  });

  it("returns notifications for org", async () => {
    const items = await fetchNotifications({ orgId: "org_demo" });
    expect(items.length).toBeGreaterThan(0);
    expect(items[0].severity).toBeTruthy();
  });

  it("marks a notification as read", async () => {
    const items = await fetchNotifications({ orgId: "org_demo" });
    const unread = items.find((n) => !n.isRead);
    expect(unread).toBeTruthy();

    await markNotificationRead(unread!.id);
    const after = await fetchNotifications({ orgId: "org_demo" });
    const updated = after.find((n) => n.id === unread!.id);
    expect(updated?.isRead).toBe(true);
  });

  it("marks all notifications as read", async () => {
    const result = await markAllNotificationsRead("org_demo");
    expect(result.updatedCount).toBeGreaterThan(0);

    const after = await fetchNotifications({ orgId: "org_demo" });
    expect(after.every((n) => n.isRead)).toBe(true);
  });

  it("filters notifications by preferences", async () => {
    const { updateOrganizationSettings } = await import(
      "@/lib/api/organization-settings"
    );
    await updateOrganizationSettings("org_demo", {
      notifications: { informational: false, critical: true, warning: true },
    });

    const items = await fetchNotifications({ orgId: "org_demo" });
    expect(items.every((n) => n.severity !== "informational")).toBe(true);
  });
});
