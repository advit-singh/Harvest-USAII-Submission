import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEMO_ORG_ID, DEMO_USER_ID } from "../../../helpers/service-fixtures";

const mockSelect = vi.fn();
const mockInsert = vi.fn();

vi.mock("@/db/client", () => ({
  db: {
    select: (...args: unknown[]) => mockSelect(...args),
    insert: (...args: unknown[]) => mockInsert(...args),
  },
}));

vi.mock("@/lib/api/org-context", () => ({
  getDefaultOrgContext: vi.fn(),
}));

vi.mock("@/services/platform/audit-service", () => ({
  recordAuditLog: vi.fn(),
}));

import { getDefaultOrgContext } from "@/lib/api/org-context";
import {
  listRoles,
  resolveOrganizationIdForRoles,
} from "@/services/organization/role-service";

describe("role-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelect.mockReturnValue({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue([
        {
          id: "role-admin",
          name: "Admin",
          description: "Full access",
          is_system_role: true,
        },
        {
          id: "role-viewer",
          name: "Viewer",
          description: "Read-only",
          is_system_role: true,
        },
      ]),
      innerJoin: vi.fn().mockReturnThis(),
    });
  });

  it("listRoles returns roles without permissions by default", async () => {
    const roles = await listRoles(DEMO_ORG_ID);

    expect(roles).toHaveLength(2);
    expect(roles[0]?.name).toBe("Admin");
    expect(roles[1]?.name).toBe("Viewer");
    expect(roles[0]).not.toHaveProperty("permissionIds");
  });

  it("listRoles includes permission ids when requested", async () => {
    let call = 0;
    mockSelect.mockImplementation(() => {
      call += 1;
      if (call === 1) {
        return {
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          orderBy: vi.fn().mockResolvedValue([
            { id: "role-admin", name: "Admin", description: null, is_system_role: true },
          ]),
        };
      }
      return {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockImplementation(() => ({
          then: (resolve: (value: unknown[]) => void) =>
            resolve([
              { roleId: "role-admin", permissionKey: "org.manage" },
              { roleId: "role-admin", permissionKey: "uploads.manage" },
            ]),
        })),
      };
    });

    const roles = await listRoles(DEMO_ORG_ID, true);

    expect(roles).toHaveLength(1);
    expect(roles[0]).toMatchObject({
      id: "role-admin",
      permissionIds: ["org.manage", "uploads.manage"],
      isSystem: true,
    });
  });

  it("resolveOrganizationIdForRoles returns explicit organization id", async () => {
    const orgId = await resolveOrganizationIdForRoles(DEMO_USER_ID, DEMO_ORG_ID);
    expect(orgId).toBe(DEMO_ORG_ID);
    expect(getDefaultOrgContext).not.toHaveBeenCalled();
  });

  it("resolveOrganizationIdForRoles falls back to default org context", async () => {
    vi.mocked(getDefaultOrgContext).mockResolvedValue({
      organizationId: DEMO_ORG_ID,
      siteId: null,
    });

    const orgId = await resolveOrganizationIdForRoles(DEMO_USER_ID);
    expect(orgId).toBe(DEMO_ORG_ID);
  });

  it("resolveOrganizationIdForRoles throws when no organization is available", async () => {
    vi.mocked(getDefaultOrgContext).mockResolvedValue(null);

    await expect(resolveOrganizationIdForRoles(DEMO_USER_ID)).rejects.toThrow(
      "ORGANIZATION_REQUIRED",
    );
  });
});
