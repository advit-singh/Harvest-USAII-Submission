import { apiClient } from "@/lib/api/client";
import type {
  CreateOrganizationInput,
  Organization,
  OrganizationMember,
  Role,
} from "@/types/organization";
import type { RoleWithPermissions } from "@/types/settings";
import type { PermissionId } from "@/types/settings";

let mockOrganizations: Organization[] = [];
let mockMembers: OrganizationMember[] = [];

const DEFAULT_ROLE_PERMISSIONS: Record<string, PermissionId[]> = {
  role_admin: [
    "org.manage",
    "users.manage",
    "uploads.manage",
    "forecasts.view",
    "forecasts.generate",
    "recommendations.manage",
    "donations.manage",
    "reports.generate",
    "assistant.use",
    "settings.manage",
    "analytics.view",
  ],
  role_ops: [
    "uploads.manage",
    "forecasts.view",
    "forecasts.generate",
    "recommendations.manage",
    "donations.manage",
    "assistant.use",
    "analytics.view",
  ],
  role_analyst: [
    "forecasts.view",
    "reports.generate",
    "assistant.use",
    "analytics.view",
  ],
  role_donation: [
    "donations.manage",
    "forecasts.view",
    "analytics.view",
  ],
  role_viewer: ["forecasts.view", "analytics.view"],
};

let mockCustomRoles: RoleWithPermissions[] = [];

export function getMockOrganizations(): Organization[] {
  return mockOrganizations;
}

export function resetMockOrganizations(): void {
  mockOrganizations = [];
  mockMembers = [];
  mockCustomRoles = [];
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
        id: "role_donation",
        name: "Donation Coordinator",
        description: "Manage rescue opportunities",
      },
      {
        id: "role_viewer",
        name: "Viewer",
        description: "Read-only access",
      },
      ...mockCustomRoles.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
      })),
    ];
  }
  return apiClient<Role[]>("/roles");
}

export async function fetchRolesWithPermissions(): Promise<RoleWithPermissions[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_API !== "false") {
    const systemRoles: RoleWithPermissions[] = [
      {
        id: "role_admin",
        name: "Admin",
        description: "Full platform access",
        permissionIds: DEFAULT_ROLE_PERMISSIONS.role_admin,
        isSystem: true,
      },
      {
        id: "role_ops",
        name: "Operations Manager",
        description: "Upload data and execute recommendations",
        permissionIds: DEFAULT_ROLE_PERMISSIONS.role_ops,
        isSystem: true,
      },
      {
        id: "role_analyst",
        name: "Analyst",
        description: "Analyze trends and generate reports",
        permissionIds: DEFAULT_ROLE_PERMISSIONS.role_analyst,
        isSystem: true,
      },
      {
        id: "role_donation",
        name: "Donation Coordinator",
        description: "Manage rescue opportunities",
        permissionIds: DEFAULT_ROLE_PERMISSIONS.role_donation,
        isSystem: true,
      },
      {
        id: "role_viewer",
        name: "Viewer",
        description: "Read-only access",
        permissionIds: DEFAULT_ROLE_PERMISSIONS.role_viewer,
        isSystem: true,
      },
    ];
    return [...systemRoles, ...mockCustomRoles];
  }
  return apiClient<RoleWithPermissions[]>("/roles?include=permissions");
}

export async function createRole(input: {
  name: string;
  description?: string;
  permissionIds: PermissionId[];
}): Promise<RoleWithPermissions> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_API !== "false") {
    const role: RoleWithPermissions = {
      id: `role_custom_${Date.now()}`,
      name: input.name,
      description: input.description,
      permissionIds: input.permissionIds,
      isSystem: false,
    };
    mockCustomRoles = [...mockCustomRoles, role];
    return role;
  }
  return apiClient<RoleWithPermissions>("/roles", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function fetchMembers(orgId: string): Promise<OrganizationMember[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_API !== "false") {
    await new Promise((r) => setTimeout(r, 100));
    const orgMembers = mockMembers.filter((m) => m.organizationId === orgId);
    if (orgMembers.length === 0) {
      return [
        {
          id: "member_demo",
          email: "demo@projectharvest.app",
          roleId: "role_admin",
          roleName: "Admin",
          organizationId: orgId,
        },
      ];
    }
    return orgMembers;
  }
  return apiClient<OrganizationMember[]>(`/organizations/${orgId}/members`);
}

export async function removeMember(
  orgId: string,
  memberId: string,
): Promise<void> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_API !== "false") {
    mockMembers = mockMembers.filter(
      (m) => !(m.id === memberId && m.organizationId === orgId),
    );
    return;
  }
  await apiClient<void>(`/organizations/${orgId}/members/${memberId}`, {
    method: "DELETE",
  });
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
      organizationId: orgId,
    };
    mockMembers = [...mockMembers, member];
    return member;
  }
  return apiClient<OrganizationMember>(`/organizations/${orgId}/members`, {
    method: "POST",
    body: JSON.stringify({ email, roleId }),
  });
}
