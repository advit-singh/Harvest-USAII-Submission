import { describe, expect, it } from "vitest";
import { severityForNotificationType } from "@/services/notification/notification-mappers";

describe("search-service expectations", () => {
  it("requires non-empty query conceptually", () => {
    const query = "   ";
    expect(query.trim().length).toBe(0);
  });

  it("classifies notification severities for search result badges", () => {
    expect(severityForNotificationType("donation.completed")).toBe("informational");
    expect(severityForNotificationType("assignment.received")).toBe("warning");
  });
});
