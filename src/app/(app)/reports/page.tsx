import { PageHeader } from "@/components/feedback/PageHeader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { FileText } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Generate organizational reporting and exports"
      />
      <EmptyState
        icon={FileText}
        title="Reports workspace coming soon"
        description="Build reports from templates and download PDF, DOCX, or CSV exports."
      />
    </div>
  );
}
