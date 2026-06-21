import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSelectChain } from "../../../helpers/db-mock";
import { DEMO_ORG_ID, DEMO_USER_ID } from "../../../helpers/service-fixtures";

const mockSelect = vi.fn();
const mockInsert = vi.fn();

vi.mock("@/db/client", () => ({
  db: {
    select: (...args: unknown[]) => mockSelect(...args),
    insert: (...args: unknown[]) => mockInsert(...args),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn().mockResolvedValue([{ id: "notif-1", is_read: true }]),
        })),
      })),
    })),
  },
}));

vi.mock("@/services/organization/settings-service", () => ({
  getNotificationPreferences: vi.fn().mockResolvedValue({
    critical: true,
    warning: true,
    informational: true,
  }),
}));

import { getNotificationPreferences } from "@/services/organization/settings-service";
import {
  emitNotification,
  listNotifications,
  markNotificationRead,
} from "@/services/notification/notification-service";

describe("notification-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelect.mockImplementation(() =>
      createSelectChain([
        {
          id: "notif-1",
          type: "donation.completed",
          title: "Donation completed",
          message: "120 meals rescued",
          is_read: false,
          created_at: new Date("2025-06-01T12:00:00Z"),
          metadata: { href: "/rescue" },
        },
      ]),
    );
    mockInsert.mockReturnValue({
      values: vi.fn(() => ({
        returning: vi.fn().mockResolvedValue([
          {
            id: "notif-new",
            type: "forecast.generated",
            title: "Forecast ready",
            message: "New surplus forecast generated",
            is_read: false,
            created_at: new Date("2025-06-02T08:00:00Z"),
            metadata: null,
          },
        ]),
      })),
    });
  });

  it("listNotifications maps rows and applies preference filters", async () => {
    const notifications = await listNotifications({
      organizationId: DEMO_ORG_ID,
      userId: DEMO_USER_ID,
    });

    expect(getNotificationPreferences).toHaveBeenCalledWith(DEMO_ORG_ID);
    expect(notifications).toHaveLength(1);
    expect(notifications[0]?.title).toBe("Donation completed");
    expect(notifications[0]?.severity).toBe("informational");
    expect(notifications[0]?.href).toBe("/rescue");
  });

  it("listNotifications respects severity preferences", async () => {
    vi.mocked(getNotificationPreferences).mockResolvedValue({
      critical: false,
      warning: false,
      informational: false,
      emailDigest: false,
    });

    const notifications = await listNotifications({
      organizationId: DEMO_ORG_ID,
      userId: DEMO_USER_ID,
    });

    expect(notifications).toEqual([]);
  });

  it("markNotificationRead returns read state", async () => {
    const result = await markNotificationRead("notif-1", DEMO_USER_ID);
    expect(result).toEqual({ id: "notif-1", isRead: true });
  });

  it("emitNotification inserts notification and system event", async () => {
    const notification = await emitNotification({
      organizationId: DEMO_ORG_ID,
      userId: DEMO_USER_ID,
      type: "forecast.generated",
      title: "Forecast ready",
      message: "New surplus forecast generated",
    });

    expect(mockInsert).toHaveBeenCalledTimes(2);
    expect(notification.id).toBe("notif-new");
    expect(notification.title).toBe("Forecast ready");
  });
});
