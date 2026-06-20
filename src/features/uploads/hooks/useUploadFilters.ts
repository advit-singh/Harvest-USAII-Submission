"use client";

import { useUploadsStore } from "@/store/uploads-store";
import { toUploadFilters } from "@/features/uploads/config/upload-tabs";
import type { UploadTabId } from "@/types/upload";
import type { UploadFiltersInput } from "@/features/uploads/schemas/upload-filters.schema";

export function useUploadFilters(orgId: string | null) {
  const getStateForOrg = useUploadsStore((s) => s.getStateForOrg);
  const setFilters = useUploadsStore((s) => s.setFilters);
  const setActiveTab = useUploadsStore((s) => s.setActiveTab);
  const setSelectedUploadId = useUploadsStore((s) => s.setSelectedUploadId);
  const resetFilters = useUploadsStore((s) => s.resetFilters);

  const orgState = orgId ? getStateForOrg(orgId) : null;

  const updateFilters = (partial: Partial<UploadFiltersInput>) => {
    if (!orgId) return;
    setFilters(orgId, partial);
  };

  const updateActiveTab = (tab: UploadTabId) => {
    if (!orgId) return;
    setActiveTab(orgId, tab);
  };

  const selectUpload = (id: string | null) => {
    if (!orgId) return;
    setSelectedUploadId(orgId, id);
  };

  const reset = () => {
    if (!orgId) return;
    resetFilters(orgId);
  };

  const apiFilters = orgId && orgState?.filters
    ? toUploadFilters(orgState.filters, orgId)
    : null;

  return {
    filters: orgState?.filters ?? null,
    apiFilters,
    activeTab: orgState?.activeTab ?? "upload",
    selectedUploadId: orgState?.selectedUploadId ?? null,
    updateFilters,
    updateActiveTab,
    selectUpload,
    reset,
  };
}
