import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEMO_ORG_ID, DEMO_USER_ID } from "../../../helpers/service-fixtures";

const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockRoleFindFirst = vi.fn();
const mockUserFindFirst = vi.fn();
const mockMemberFindFirst = vi.fn();

vi.mock("@/db/client", () => ({
  db: {
    select: (...args: unknown[]) => mockSelect(...args),
    insert: (...args: unknown[]) => mockInsert(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
    query: {
      roles: { findFirst: (...args: unknown[]) => mockRoleFindFirst(...args) },
      users: { findFirst: (...args: unknown[]) => mockUserFindFirst(...args) },
      organization_members: { findFirst: (...args: unknown[]) => mockMemberFindFirst(...args) },
    },
  },
}));

vi.mock("@/services/platform/audit-service", () => ({
  recordAuditLog: vi.fn(),
}));

import { inviteMember, listMembers, removeMember } from "@/services/organization/member-service";

describe("member-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelect.mockReturnValue({
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([
        {
          member: { id: "mem-1" },
          user: { email: "chef@harvest.local" },
          role: { id: "role-admin", name: "Admin" },
        },
      ]),
    });
  });

  it("listMembers maps joined member rows", async () => {
    const members = await listMembers(DEMO_ORG_ID);

    expect(members).toHaveLength(1);
    expect(members[0]?.email).toBe("chef@harvest.local");
    expect(members[0]?.roleName).toBe("Admin");
    expect(members[0]?.organizationId).toBe(DEMO_ORG_ID);
  });

  it("inviteMember throws when role is not found", async () => {
    mockRoleFindFirst.mockResolvedValue(null);

    await expect(
      inviteMember(DEMO_ORG_ID, "new@harvest.local", "missing-role", DEMO_USER_ID),
    ).rejects.toThrow("ROLE_NOT_FOUND");
  });

  it("inviteMember creates membership for existing user", async () => {
    mockRoleFindFirst.mockResolvedValue({
      id: "role-viewer",
      name: "Viewer",
      organization_id: DEMO_ORG_ID,
    });
    mockUserFindFirst.mockResolvedValue({
      id: "user-new",
      email: "new@harvest.local",
    });
    mockMemberFindFirst.mockResolvedValue(null);
    mockInsert.mockReturnValue({
      values: vi.fn(() => ({
        returning: vi.fn().mockResolvedValue([{ id: "mem-new" }]),
      })),
    });

    const member = await inviteMember(
      DEMO_ORG_ID,
      "new@harvest.local",
      "role-viewer",
      DEMO_USER_ID,
    );

    expect(member.email).toBe("new@harvest.local");
    expect(member.roleName).toBe("Viewer");
    expect(member.id).toBe("mem-new");
  });

  it("removeMember throws when member is not found", async () => {
    mockMemberFindFirst.mockResolvedValue(null);

    await expect(removeMember(DEMO_ORG_ID, "missing", DEMO_USER_ID)).rejects.toThrow(
      "MEMBER_NOT_FOUND",
    );
  });

  it("removeMember deactivates an existing member", async () => {
    mockMemberFindFirst.mockResolvedValue({ id: "mem-1", organization_id: DEMO_ORG_ID });
    mockUpdate.mockReturnValue({
      set: vi.fn(() => ({
        where: vi.fn().mockResolvedValue(undefined),
      })),
    });

    await expect(removeMember(DEMO_ORG_ID, "mem-1", DEMO_USER_ID)).resolves.toBeUndefined();
    expect(mockUpdate).toHaveBeenCalled();
  });
});
