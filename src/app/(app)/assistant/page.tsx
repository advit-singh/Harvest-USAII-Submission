import { PageHeader } from "@/components/feedback/PageHeader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Bot } from "lucide-react";

export default function AssistantPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Assistant"
        description="Natural-language access to your operational intelligence"
      />
      <EmptyState
        icon={Bot}
        title="AI Assistant coming soon"
        description="Ask questions about waste trends, forecasts, and recommendations with cited evidence."
      />
    </div>
  );
}
