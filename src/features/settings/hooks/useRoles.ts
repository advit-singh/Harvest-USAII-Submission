"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createRole,
  fetchRolesWithPermissions,
} from "@/lib/api/organizations";
import { settingsKeys } from "@/features/settings/hooks/settings-keys";
import type { PermissionId } from "@/types/settings";

export function useRolesWithPermissions() {
  return useQuery({
    queryKey: settingsKeys.rolesWithPermissions(),
    queryFn: fetchRolesWithPermissions,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      name: string;
      description?: string;
      permissionIds: PermissionId[];
    }) => createRole(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: settingsKeys.rolesWithPermissions(),
      });
      queryClient.invalidateQueries({ queryKey: settingsKeys.roles() });
    },
  });
}
