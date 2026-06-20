"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchOrganizationSettings,
  updateOrganizationSettings,
} from "@/lib/api/organization-settings";
import { settingsKeys } from "@/features/settings/hooks/settings-keys";
import type { OrganizationSettingsPatch } from "@/types/settings";

export function useOrganizationSettings(orgId: string | null) {
  return useQuery({
    queryKey: settingsKeys.settings(orgId ?? ""),
    queryFn: () => fetchOrganizationSettings(orgId!),
    enabled: Boolean(orgId),
  });
}

export function useUpdateOrganizationSettings(orgId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patch: OrganizationSettingsPatch) =>
      updateOrganizationSettings(orgId!, patch),
    onSuccess: (data) => {
      if (orgId) {
        queryClient.setQueryData(settingsKeys.settings(orgId), data);
      }
    },
  });
}
