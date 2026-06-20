"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchRecipients } from "@/lib/api/recipients";
import { recipientKeys } from "@/features/rescue/hooks/rescue-keys";

export function useRecipients(orgId: string | null) {
  return useQuery({
    queryKey: recipientKeys.list(orgId ?? ""),
    queryFn: () => fetchRecipients(orgId!),
    enabled: Boolean(orgId),
    staleTime: 120_000,
  });
}
