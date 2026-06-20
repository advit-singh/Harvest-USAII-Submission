export const settingsKeys = {
  all: ["settings"] as const,
  organization: (orgId: string) =>
    [...settingsKeys.all, "organization", orgId] as const,
  settings: (orgId: string) =>
    [...settingsKeys.all, "org-settings", orgId] as const,
  members: (orgId: string) => [...settingsKeys.all, "members", orgId] as const,
  roles: () => [...settingsKeys.all, "roles"] as const,
  rolesWithPermissions: () =>
    [...settingsKeys.all, "roles-permissions"] as const,
};
