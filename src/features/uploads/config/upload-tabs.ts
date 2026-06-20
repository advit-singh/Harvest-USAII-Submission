import type { UploadTabId } from "@/types/upload";
import type { UploadFiltersInput } from "@/features/uploads/schemas/upload-filters.schema";
import type { UploadFilters } from "@/types/upload";
import { Clock, History, ShieldAlert, Upload } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface UploadTabConfig {
  id: UploadTabId;
  label: string;
  description: string;
  icon: LucideIcon;
}

export const UPLOAD_TABS: UploadTabConfig[] = [
  {
    id: "upload",
    label: "Upload",
    description: "Add operational data files",
    icon: Upload,
  },
  {
    id: "queue",
    label: "Processing",
    description: "Monitor in-flight uploads",
    icon: Clock,
  },
  {
    id: "history",
    label: "History",
    description: "Browse past uploads",
    icon: History,
  },
  {
    id: "validation",
    label: "Validation",
    description: "Review detected anomalies",
    icon: ShieldAlert,
  },
];

export const VALID_UPLOAD_TABS: UploadTabId[] = UPLOAD_TABS.map((t) => t.id);

export function toUploadFilters(input: UploadFiltersInput, orgId: string): UploadFilters {
  return {
    organizationId: orgId,
    status: input.status,
    siteId: input.siteId !== "all" ? input.siteId : undefined,
    search: input.search.trim() || undefined,
    limit: input.limit,
  };
}

export function isQueueStatus(status: string): boolean {
  return (
    status === "uploaded" ||
    status === "classifying" ||
    status === "extracting" ||
    status === "normalizing" ||
    status === "validating" ||
    status === "review_required"
  );
}
