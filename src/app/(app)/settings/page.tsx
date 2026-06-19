import { PageHeader } from "@/components/feedback/PageHeader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Configure organization, users, permissions, and preferences"
      />
      <EmptyState
        icon={Settings}
        title="Settings workspace coming soon"
        description="Manage organization profile, users, roles, AI settings, and appearance."
      />
    </div>
  );
}
