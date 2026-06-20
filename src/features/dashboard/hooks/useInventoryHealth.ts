"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchInventoryHealth } from "@/lib/api/inventory";

export const inventoryKeys = {
  all: ["inventory-health"] as const,
  detail: (orgId: string) => [...inventoryKeys.all, orgId] as const,
};

export function useInventoryHealth(orgId: string | null) {
  return useQuery({
    queryKey: inventoryKeys.detail(orgId ?? ""),
    queryFn: () => fetchInventoryHealth(orgId!),
    enabled: Boolean(orgId),
    staleTime: 60_000,
  });
}
