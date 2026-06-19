import { PageHeader } from "@/components/feedback/PageHeader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { TrendingUp } from "lucide-react";

export default function PredictionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Predictions"
        description="Prevent waste before it occurs with forecasts and recommendations"
      />
      <EmptyState
        icon={TrendingUp}
        title="Predictions workspace coming soon"
        description="Explore forecasts, recommendations, and the scenario simulator."
      />
    </div>
  );
}
