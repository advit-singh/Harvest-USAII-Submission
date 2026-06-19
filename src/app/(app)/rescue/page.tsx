import { PageHeader } from "@/components/feedback/PageHeader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { HeartHandshake } from "lucide-react";

export default function RescuePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Rescue Network"
        description="Manage surplus redistribution and donation opportunities"
      />
      <EmptyState
        icon={HeartHandshake}
        title="Rescue Network coming soon"
        description="Review donation opportunities, match recipients, and track outcomes."
      />
    </div>
  );
}
