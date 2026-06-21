"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchOrgSites, getDefaultSiteId, toSiteOptions } from "@/lib/api/sites";
import { organizationKeys } from "@/features/organizations/hooks/useOrganizations";

export const orgSiteKeys = {
  all: [...organizationKeys.all, "sites"] as const,
  list: (orgId: string) => [...orgSiteKeys.all, orgId] as const,
};

export function useOrgSites(orgId: string | null) {
  const query = useQuery({
    queryKey: orgSiteKeys.list(orgId ?? ""),
    queryFn: () => fetchOrgSites(orgId!),
    enabled: Boolean(orgId),
    staleTime: 60_000,
  });

  const sites = query.data ?? [];
  const siteOptions = toSiteOptions(sites);
  const defaultSiteId = getDefaultSiteId(sites);

  return {
    sites,
    siteOptions,
    defaultSiteId,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
