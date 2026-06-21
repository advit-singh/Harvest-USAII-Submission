import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEMO_ORG_ID, DEMO_USER_ID } from "../../../helpers/service-fixtures";

const mockSelect = vi.fn();
const mockMemberFindFirst = vi.fn();
const mockOrgFindFirst = vi.fn();

vi.mock("@/db/client", () => ({
  db: {
    select: (...args: unknown[]) => mockSelect(...args),
    query: {
      organization_members: { findFirst: (...args: unknown[]) => mockMemberFindFirst(...args) },
      organizations: { findFirst: (...args: unknown[]) => mockOrgFindFirst(...args) },
    },
  },
}));

vi.mock("@/services/platform/audit-service", () => ({
  recordAuditLog: vi.fn(),
}));

import {
  getOrganizationById,
  listOrganizationsForUser,
} from "@/services/organization/organization-service";

describe("organization-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelect.mockReturnValue({
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([
        {
          org: {
            id: DEMO_ORG_ID,
            name: "Demo Harvest",
            organization_type: "university",
            timezone: "America/New_York",
            country: "US",
            state: "NY",
            city: "New York",
            default_unit_system: "imperial",
            logo_url: null,
            is_active: true,
          },
        },
      ]),
    });
  });

  it("listOrganizationsForUser maps active organizations", async () => {
    const orgs = await listOrganizationsForUser(DEMO_USER_ID);

    expect(orgs).toHaveLength(1);
    expect(orgs[0]?.id).toBe(DEMO_ORG_ID);
    expect(orgs[0]?.name).toBe("Demo Harvest");
    expect(orgs[0]?.isActive).toBe(true);
  });

  it("listOrganizationsForUser filters inactive organizations", async () => {
    mockSelect.mockReturnValue({
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([
        {
          org: {
            id: DEMO_ORG_ID,
            name: "Inactive Org",
            organization_type: "university",
            timezone: "UTC",
            country: null,
            state: null,
            city: null,
            default_unit_system: "metric",
            logo_url: null,
            is_active: false,
          },
        },
      ]),
    });

    const orgs = await listOrganizationsForUser(DEMO_USER_ID);
    expect(orgs).toEqual([]);
  });

  it("getOrganizationById returns null without active membership", async () => {
    mockMemberFindFirst.mockResolvedValue(null);

    const org = await getOrganizationById(DEMO_ORG_ID, DEMO_USER_ID);
    expect(org).toBeNull();
  });

  it("getOrganizationById returns organization for active member", async () => {
    mockMemberFindFirst.mockResolvedValue({
      organization_id: DEMO_ORG_ID,
      user_id: DEMO_USER_ID,
      status: "active",
    });
    mockOrgFindFirst.mockResolvedValue({
      id: DEMO_ORG_ID,
      name: "Demo Harvest",
      organization_type: "university",
      timezone: "America/New_York",
      country: "US",
      state: "NY",
      city: "New York",
      default_unit_system: "imperial",
      logo_url: null,
      is_active: true,
    });

    const org = await getOrganizationById(DEMO_ORG_ID, DEMO_USER_ID);
    expect(org?.name).toBe("Demo Harvest");
  });
});
