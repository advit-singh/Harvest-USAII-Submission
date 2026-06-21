import { beforeEach, describe, expect, it, vi } from "vitest";
import { getTemplates, listReports } from "@/services/report/report-service";

const mockSelect = vi.fn();

vi.mock("@/db/client", () => ({
  db: {
    select: () => mockSelect(),
    query: {
      organization_sites: { findFirst: vi.fn() },
      users: { findFirst: vi.fn() },
    },
  },
}));

describe("report-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelect.mockReturnValue({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    });
  });

  it("getTemplates returns all registered templates", () => {
    const templates = getTemplates();
    expect(templates.length).toBeGreaterThanOrEqual(8);
    expect(templates.every((t) => t.id && t.name && t.description)).toBe(true);
    expect(templates.some((t) => t.id === "monthly_summary")).toBe(true);
  });

  it("listReports returns empty array when no reports", async () => {
    mockSelect
      .mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      });

    const reports = await listReports({
      organizationId: "00000000-0000-4000-8000-000000000001",
      status: "all",
      template: "all",
      siteId: "all",
    });
    expect(reports).toEqual([]);
  });
});
