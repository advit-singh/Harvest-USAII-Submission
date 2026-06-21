import { describe, expect, it } from "vitest";
import { mapNotificationRow, severityForNotificationType } from "@/services/notification/notification-mappers";

describe("notification-mappers", () => {
  it("maps database row to API notification", () => {
    const result = mapNotificationRow({
      id: "n1",
      type: "upload.completed",
      title: "Upload processed",
      message: "File committed",
      is_read: false,
      created_at: new Date("2026-06-20T12:00:00Z"),
      metadata: { href: "/uploads" },
    });

    expect(result.id).toBe("n1");
    expect(result.severity).toBe("informational");
    expect(result.href).toBe("/uploads");
    expect(result.isRead).toBe(false);
  });

  it("derives severity from type when metadata absent", () => {
    expect(
      mapNotificationRow({
        id: "n2",
        type: "forecast.generated",
        title: "Forecasts",
        message: "Updated",
        is_read: true,
        created_at: new Date(),
        metadata: null,
      }).severity,
    ).toBe(severityForNotificationType("forecast.generated"));
  });
});
