"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchMembers, fetchRolesWithPermissions } from "@/lib/api/organizations";
import type { PermissionId } from "@/types/settings";

export function useCanGenerateReports(orgId: string | null) {
  const membersQuery = useQuery({
    queryKey: ["organizations", "members", orgId],
    queryFn: () => fetchMembers(orgId!),
    enabled: Boolean(orgId),
    staleTime: 60_000,
  });

  const rolesQuery = useQuery({
    queryKey: ["organizations", "roles-permissions"],
    queryFn: fetchRolesWithPermissions,
    staleTime: 300_000,
  });

  const member = membersQuery.data?.[0];
  const role = rolesQuery.data?.find((r) => r.id === member?.roleId);
  const canGenerate = role?.permissionIds.includes(
    "reports.generate" as PermissionId,
  );

  return {
    canGenerate: canGenerate ?? true,
    isLoading: membersQuery.isLoading || rolesQuery.isLoading,
  };
}
