"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { EmptyOrgDashboard } from "@/features/organizations/components/EmptyOrgDashboard";
import { PageLoadingState } from "@/components/feedback/LoadingState";
import { UploadToolbar } from "@/features/uploads/components/UploadToolbar";
import { UploadTabNav } from "@/features/uploads/components/UploadTabNav";
import { UploadQueryState } from "@/features/uploads/components/UploadQueryState";
import { ExtractionReviewDrawer } from "@/features/uploads/components/review/ExtractionReviewDrawer";
import { useUploadFilters } from "@/features/uploads/hooks/useUploadFilters";
import { useUploadPolling } from "@/features/uploads/hooks/useUploadPolling";
import { useUploadsList } from "@/features/uploads/hooks/useUploads";
import { VALID_UPLOAD_TABS } from "@/features/uploads/config/upload-tabs";
import type { UploadTabId } from "@/types/upload";

interface UploadShellProps {
  orgId: string | null;
}

export function UploadShell({ orgId }: UploadShellProps) {
  const searchParams = useSearchParams();

  const {
    filters,
    apiFilters,
    activeTab,
    selectedUploadId,
    updateFilters,
    updateActiveTab,
    selectUpload,
    reset,
  } = useUploadFilters(orgId);

  const tabParam = searchParams.get("tab");
  const idParam = searchParams.get("id");
  const urlTab =
    tabParam && VALID_UPLOAD_TABS.includes(tabParam as UploadTabId)
      ? (tabParam as UploadTabId)
      : null;

  useEffect(() => {
    if (urlTab && urlTab !== activeTab && orgId) {
      updateActiveTab(urlTab);
    }
  }, [urlTab, activeTab, orgId, updateActiveTab]);

  useEffect(() => {
    if (idParam && orgId) {
      selectUpload(idParam);
    }
  }, [idParam, orgId, selectUpload]);

  const uploadsQuery = useUploadsList(apiFilters);
  useUploadPolling(orgId, uploadsQuery.data, activeTab === "queue");

  const reviewOpen = Boolean(selectedUploadId);

  if (!orgId || !filters || !apiFilters) {
    return <EmptyOrgDashboard />;
  }

  const handleReview = (id: string) => {
    selectUpload(id);
  };

  const handleUploadSuccess = (uploadId: string) => {
    updateActiveTab("queue");
    selectUpload(uploadId);
  };

  if (uploadsQuery.isLoading && !uploadsQuery.data) {
    return <PageLoadingState />;
  }

  return (
    <div className="space-y-4">
      <UploadToolbar
        filters={filters}
        onFiltersChange={updateFilters}
        onResetFilters={reset}
        onRefresh={() => uploadsQuery.refetch()}
      />

      <UploadQueryState
        isLoading={uploadsQuery.isLoading && !uploadsQuery.data}
        isError={uploadsQuery.isError}
        onRetry={() => uploadsQuery.refetch()}
      >
        <UploadTabNav
          orgId={orgId}
          activeTab={activeTab}
          uploads={uploadsQuery.data ?? []}
          onTabChange={updateActiveTab}
          onReview={handleReview}
          onUploadSuccess={handleUploadSuccess}
        />
      </UploadQueryState>

      <ExtractionReviewDrawer
        orgId={orgId}
        uploadId={selectedUploadId}
        open={reviewOpen}
        onOpenChange={(open) => {
          if (!open) selectUpload(null);
        }}
      />
    </div>
  );
}
