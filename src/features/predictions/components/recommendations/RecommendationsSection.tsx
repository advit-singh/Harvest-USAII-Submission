"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { RecommendationFilters } from "@/features/predictions/components/recommendations/RecommendationFilters";
import { RecommendationCard } from "@/features/predictions/components/recommendations/RecommendationCard";
import { RecommendationBulkActions } from "@/features/predictions/components/recommendations/RecommendationBulkActions";
import { RecommendationDetailDrawer } from "@/features/predictions/components/recommendations/RecommendationDetailDrawer";
import { RecommendationAssignDialog } from "@/features/predictions/components/recommendations/RecommendationAssignDialog";
import { PredictionsQueryState } from "@/features/predictions/components/PredictionsQueryState";
import { useRecommendationsList } from "@/features/predictions/hooks/useRecommendationsList";
import type { RecommendationFiltersInput } from "@/features/predictions/schemas/recommendation-filters.schema";

interface RecommendationsSectionProps {
  orgId: string;
  filters: RecommendationFiltersInput;
  onFiltersChange: (partial: Partial<RecommendationFiltersInput>) => void;
}

export function RecommendationsSection({
  orgId,
  filters,
  onFiltersChange,
}: RecommendationsSectionProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [assignId, setAssignId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);

  const query = useRecommendationsList(orgId, filters);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const openDetail = (id: string) => {
    setDetailId(id);
    setDetailOpen(true);
  };

  const openAssign = (id: string) => {
    setAssignId(id);
    setAssignOpen(true);
  };

  return (
    <div className="space-y-4">
      <RecommendationFilters orgId={orgId} filters={filters} onFiltersChange={onFiltersChange} />

      <PredictionsQueryState
        query={query}
        emptyIcon={Sparkles}
        emptyTitle="No recommendations"
        emptyDescription="Recommendations appear after forecasts are generated."
        isEmpty={(data) => data.length === 0}
      >
        {(recommendations) => (
          <>
            <RecommendationBulkActions
              orgId={orgId}
              selectedIds={selectedIds}
              recommendations={recommendations}
              onClearSelection={() => setSelectedIds([])}
            />

            <ul className="space-y-3" role="list">
              {recommendations.map((rec) => (
                <div key={rec.id} className="flex gap-2">
                  <input
                    type="checkbox"
                    className="mt-5 h-4 w-4 shrink-0"
                    checked={selectedIds.includes(rec.id)}
                    onChange={() => toggleSelect(rec.id)}
                    aria-label={`Select ${rec.title}`}
                  />
                  <div className="flex-1">
                    <RecommendationCard
                      orgId={orgId}
                      recommendation={rec}
                      selected={detailId === rec.id}
                      onSelect={() => openDetail(rec.id)}
                      onAssign={() => openAssign(rec.id)}
                    />
                  </div>
                </div>
              ))}
            </ul>
          </>
        )}
      </PredictionsQueryState>

      <RecommendationDetailDrawer
        orgId={orgId}
        recommendationId={detailId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      <RecommendationAssignDialog
        orgId={orgId}
        recommendationId={assignId}
        open={assignOpen}
        onOpenChange={setAssignOpen}
      />
    </div>
  );
}
