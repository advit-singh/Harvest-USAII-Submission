export const notificationKeys = {
  all: ["notifications"] as const,
  list: (orgId: string) => [...notificationKeys.all, "list", orgId] as const,
};
