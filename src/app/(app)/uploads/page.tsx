import { PageHeader } from "@/components/feedback/PageHeader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Upload } from "lucide-react";

export default function UploadsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Uploads"
        description="Convert raw operational data into intelligence"
      />
      <EmptyState
        icon={Upload}
        title="Upload workspace coming soon"
        description="Upload receipts, attendance records, inventory logs, and more. This workspace will connect to the upload pipeline when ready."
      />
    </div>
  );
}
