"use client";

import { useQuery } from "@tanstack/react-query";
import { searchOrg } from "@/lib/api/search";
import type { SearchResultItem } from "@/services/search/search-service";

export const searchKeys = {
  all: ["search"] as const,
  query: (orgId: string, q: string) => [...searchKeys.all, orgId, q] as const,
};

export function useGlobalSearch(orgId: string | null, query: string) {
  const trimmed = query.trim();
  return useQuery({
    queryKey: searchKeys.query(orgId ?? "", trimmed),
    queryFn: () => searchOrg(orgId!, trimmed),
    enabled: Boolean(orgId) && trimmed.length >= 2,
    staleTime: 30_000,
  });
}

export function flattenSearchResults(
  results: Awaited<ReturnType<typeof searchOrg>> | undefined,
): SearchResultItem[] {
  if (!results) return [];
  return [
    ...results.inventory,
    ...results.forecasts,
    ...results.reports,
    ...results.recommendations,
    ...results.uploads,
    ...results.conversations,
  ];
}
