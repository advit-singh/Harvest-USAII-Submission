"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UPLOAD_TABS } from "@/features/uploads/config/upload-tabs";
import { UploadDropzone } from "@/features/uploads/components/upload/UploadDropzone";
import { ProcessingQueue } from "@/features/uploads/components/queue/ProcessingQueue";
import { UploadHistoryTable } from "@/features/uploads/components/history/UploadHistoryTable";
import { ValidationCenter } from "@/features/uploads/components/validation/ValidationCenter";
import { EmptyState } from "@/components/feedback/EmptyState";
import { History } from "lucide-react";
import type { UploadSummary, UploadTabId } from "@/types/upload";

interface UploadTabNavProps {
  orgId: string;
  activeTab: UploadTabId;
  uploads: UploadSummary[];
  onTabChange: (tab: UploadTabId) => void;
  onReview: (id: string) => void;
  onUploadSuccess: (uploadId: string) => void;
}

export function UploadTabNav({
  orgId,
  activeTab,
  uploads,
  onTabChange,
  onReview,
  onUploadSuccess,
}: UploadTabNavProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleTabChange = useCallback(
    (value: string) => {
      const tab = value as UploadTabId;
      onTabChange(tab);
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tab);
      if (tab !== "queue" && tab !== "history") {
        params.delete("id");
      }
      router.replace(`/uploads?${params.toString()}`, { scroll: false });
    },
    [onTabChange, router, searchParams],
  );

  const historyUploads = uploads.filter(
    (u) =>
      u.status === "completed" ||
      u.status === "failed" ||
      u.status === "rejected",
  );

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
        {UPLOAD_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-1.5"
            >
              <Icon className="h-4 w-4" aria-hidden />
              <span>{tab.label}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>

      <TabsContent value="upload">
        <UploadDropzone orgId={orgId} onUploadSuccess={onUploadSuccess} />
      </TabsContent>

      <TabsContent value="queue">
        <ProcessingQueue uploads={uploads} onReview={onReview} />
      </TabsContent>

      <TabsContent value="history">
        {historyUploads.length === 0 ? (
          <EmptyState
            icon={History}
            title="No upload history"
            description="Completed, failed, and rejected uploads will appear here."
          />
        ) : (
          <UploadHistoryTable uploads={historyUploads} onReview={onReview} />
        )}
      </TabsContent>

      <TabsContent value="validation">
        <ValidationCenter orgId={orgId} uploads={uploads} />
      </TabsContent>
    </Tabs>
  );
}
