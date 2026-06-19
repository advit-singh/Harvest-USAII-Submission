import { apiClient } from "@/lib/api/client";
import type {
  CreateOrganizationInput,
  Organization,
  OrganizationMember,
  Role,
} from "@/types/organization";

let mockOrganizations: Organization[] = [];
let mockMembers: OrganizationMember[] = [];

export function getMockOrganizations(): Organization[] {
  return mockOrganizations;
}

export function resetMockOrganizations(): void {
  mockOrganizations = [];
  mockMembers = [];
}

export async function fetchOrganizations(): Promise<Organization[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_API !== "false") {
    return mockOrganizations;
  }
  return apiClient<Organization[]>("/organizations");
}

export async function createOrganization(
  input: CreateOrganizationInput,
): Promise<Organization> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_API !== "false") {
    const org: Organization = {
      id: `org_${Date.now()}`,
      name: input.name,
      type: input.type,
      timezone: input.timezone,
      country: input.country,
      state: input.state,
      city: input.city,
      defaultUnitSystem: input.defaultUnitSystem ?? "imperial",
      isActive: true,
    };
    mockOrganizations = [...mockOrganizations, org];
    return org;
  }
  return apiClient<Organization>("/organizations", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function fetchRoles(): Promise<Role[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_API !== "false") {
    return [
      { id: "role_admin", name: "Admin", description: "Full platform access" },
      {
        id: "role_ops",
        name: "Operations Manager",
        description: "Upload data and execute recommendations",
      },
      { id: "role_analyst", name: "Analyst", description: "Analyze trends" },
      {
        id: "role_viewer",
        name: "Viewer",
        description: "Read-only access",
      },
    ];
  }
  return apiClient<Role[]>("/roles");
}

export async function inviteMember(
  orgId: string,
  email: string,
  roleId: string,
): Promise<OrganizationMember> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_API !== "false") {
    const member: OrganizationMember = {
      id: `member_${Date.now()}`,
      email,
      roleId,
      roleName: roleId.replace("role_", ""),
    };
    mockMembers = [...mockMembers, member];
    return member;
  }
  return apiClient<OrganizationMember>(`/organizations/${orgId}/members`, {
    method: "POST",
    body: JSON.stringify({ email, roleId }),
  });
}
