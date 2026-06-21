"use client";

import { useMemo } from "react";
import { useUploadsStore } from "@/store/uploads-store";
import { toUploadFilters } from "@/features/uploads/config/upload-tabs";
import { DEFAULT_UPLOAD_FILTERS } from "@/features/uploads/schemas/upload-filters.schema";
import type { UploadTabId } from "@/types/upload";
import type { UploadFiltersInput } from "@/features/uploads/schemas/upload-filters.schema";

export function useUploadFilters(orgId: string | null) {
  const stored = useUploadsStore((s) => (orgId ? s.orgStates[orgId] : undefined));
  const setFilters = useUploadsStore((s) => s.setFilters);
  const setActiveTab = useUploadsStore((s) => s.setActiveTab);
  const setSelectedUploadId = useUploadsStore((s) => s.setSelectedUploadId);
  const resetFilters = useUploadsStore((s) => s.resetFilters);

  const orgState = useMemo(() => {
    if (!orgId) return null;
    const defaults = {
      filters: { ...DEFAULT_UPLOAD_FILTERS },
      activeTab: "upload" as UploadTabId,
      selectedUploadId: null as string | null,
    };
    if (!stored) return defaults;
    return {
      ...defaults,
      ...stored,
      filters: { ...defaults.filters, ...stored.filters },
    };
  }, [orgId, stored]);

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
