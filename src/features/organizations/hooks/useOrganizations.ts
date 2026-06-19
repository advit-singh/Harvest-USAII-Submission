"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createOrganization,
  fetchOrganizations,
  fetchRoles,
  inviteMember,
} from "@/lib/api/organizations";
import { useOrgStore } from "@/store/org-store";
import type { CreateOrganizationInput } from "@/types/organization";

export const organizationKeys = {
  all: ["organizations"] as const,
  list: () => [...organizationKeys.all, "list"] as const,
  roles: () => ["roles"] as const,
};

export function useOrganizations() {
  const { activeOrgId, setActiveOrgId } = useOrgStore();

  const query = useQuery({
    queryKey: organizationKeys.list(),
    queryFn: fetchOrganizations,
  });

  const activeOrg =
    query.data?.find((org) => org.id === activeOrgId) ?? query.data?.[0];

  useEffect(() => {
    if (query.data?.length && !activeOrgId && query.data[0]) {
      setActiveOrgId(query.data[0].id);
    }
  }, [query.data, activeOrgId, setActiveOrgId]);

  return {
    organizations: query.data ?? [],
    activeOrg,
    activeOrgId: activeOrgId ?? activeOrg?.id ?? null,
    setActiveOrgId,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useRoles() {
  return useQuery({
    queryKey: organizationKeys.roles(),
    queryFn: fetchRoles,
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();
  const { setActiveOrgId } = useOrgStore();

  return useMutation({
    mutationFn: (input: CreateOrganizationInput) => createOrganization(input),
    onSuccess: (org) => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.list() });
      setActiveOrgId(org.id);
    },
  });
}

export function useInviteMember() {
  return useMutation({
    mutationFn: ({
      orgId,
      email,
      roleId,
    }: {
      orgId: string;
      email: string;
      roleId: string;
    }) => inviteMember(orgId, email, roleId),
  });
}
