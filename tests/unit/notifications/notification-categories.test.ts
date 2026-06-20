import { describe, expect, it } from "vitest";
import {
  formatNotificationTime,
  getNotificationIcon,
  SEVERITY_LABELS,
} from "@/features/notifications/config/notification-categories";

describe("notification categories", () => {
  it("maps types to icons", () => {
    const icon = getNotificationIcon("upload.completed");
    expect(icon).toBeTruthy();
  });

  it("formats recent times", () => {
    const recent = formatNotificationTime(new Date().toISOString());
    expect(recent).toBe("Just now");
  });

  it("defines severity labels", () => {
    expect(SEVERITY_LABELS.critical).toBe("Critical");
    expect(SEVERITY_LABELS.warning).toBe("Warning");
    expect(SEVERITY_LABELS.informational).toBe("Info");
  });
});
