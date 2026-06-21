import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEMO_ORG_ID, DEMO_USER_ID } from "../../../helpers/service-fixtures";

const mockInsert = vi.fn();
const mockFindMany = vi.fn();
const mockFindFirst = vi.fn();

vi.mock("@/db/client", () => ({
  db: {
    insert: (...args: unknown[]) => mockInsert(...args),
    query: {
      audit_logs: {
        findMany: (...args: unknown[]) => mockFindMany(...args),
        findFirst: (...args: unknown[]) => mockFindFirst(...args),
      },
    },
  },
}));

import { listAuditLogs, recordAuditLog } from "@/services/platform/audit-service";

describe("audit-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInsert.mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    });
    mockFindMany.mockResolvedValue([
      {
        id: "audit-1",
        organization_id: DEMO_ORG_ID,
        user_id: DEMO_USER_ID,
        entity_type: "organization",
        entity_id: DEMO_ORG_ID,
        action: "created",
        old_value: null,
        new_value: { name: "Demo Harvest" },
        timestamp: new Date("2025-06-01T10:00:00Z"),
      },
    ]);
  });

  it("recordAuditLog inserts an audit row", async () => {
    await recordAuditLog({
      organizationId: DEMO_ORG_ID,
      userId: DEMO_USER_ID,
      entityType: "organization",
      entityId: DEMO_ORG_ID,
      action: "created",
      newValue: { name: "Demo Harvest" },
    });

    expect(mockInsert).toHaveBeenCalled();
  });

  it("listAuditLogs maps database rows", async () => {
    const logs = await listAuditLogs({ organizationId: DEMO_ORG_ID });

    expect(mockFindMany).toHaveBeenCalled();
    expect(logs).toHaveLength(1);
    expect(logs[0]?.action).toBe("created");
    expect(logs[0]?.newValue).toEqual({ name: "Demo Harvest" });
    expect(logs[0]?.timestamp).toBe("2025-06-01T10:00:00.000Z");
  });

  it("getAuditLogById delegates to query.findFirst", async () => {
    const { getAuditLogById } = await import("@/services/platform/audit-service");
    mockFindFirst.mockResolvedValue({ id: "audit-1" });

    const row = await getAuditLogById("audit-1", DEMO_ORG_ID);
    expect(row?.id).toBe("audit-1");
  });
});
