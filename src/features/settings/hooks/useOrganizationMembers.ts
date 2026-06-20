"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchMembers,
  inviteMember,
  removeMember,
} from "@/lib/api/organizations";
import { settingsKeys } from "@/features/settings/hooks/settings-keys";

export function useOrganizationMembers(orgId: string | null) {
  return useQuery({
    queryKey: settingsKeys.members(orgId ?? ""),
    queryFn: () => fetchMembers(orgId!),
    enabled: Boolean(orgId),
  });
}

export function useInviteMember(orgId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, roleId }: { email: string; roleId: string }) =>
      inviteMember(orgId!, email, roleId),
    onSuccess: () => {
      if (orgId) {
        queryClient.invalidateQueries({ queryKey: settingsKeys.members(orgId) });
      }
    },
  });
}

export function useRemoveMember(orgId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => removeMember(orgId!, memberId),
    onSuccess: () => {
      if (orgId) {
        queryClient.invalidateQueries({ queryKey: settingsKeys.members(orgId) });
      }
    },
  });
}
