import { PageHeader } from "@/components/feedback/PageHeader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Understand historical operations and waste patterns"
      />
      <EmptyState
        icon={BarChart3}
        title="Analytics workspace coming soon"
        description="Explore waste, inventory, attendance, donation, and impact analytics."
      />
    </div>
  );
}
