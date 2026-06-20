"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { AiBadge } from "@/components/ai/AiBadge";
import { ConfidenceIndicator } from "@/components/ai/ConfidenceIndicator";
import { Badge } from "@/components/ui/badge";
import { RecommendationActionBar } from "@/features/predictions/components/recommendations/RecommendationActionBar";
import { useRecommendationDetail } from "@/features/predictions/hooks/useRecommendationDetail";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";

interface RecommendationDetailDrawerProps {
  orgId: string;
  recommendationId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecommendationDetailDrawer({
  orgId,
  recommendationId,
  open,
  onOpenChange,
}: RecommendationDetailDrawerProps) {
  const query = useRecommendationDetail(recommendationId);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Recommendation Detail</DrawerTitle>
        </DrawerHeader>
        <div className="space-y-4 px-4 pb-8">
          {query.isLoading && <LoadingState rows={4} />}
          {query.isError && (
            <ErrorState
              message="Unable to load recommendation."
              onRetry={() => query.refetch()}
            />
          )}
          {query.data && (
            <>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold">{query.data.title}</h2>
                    <AiBadge />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {query.data.siteName}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="capitalize">{query.data.priority}</Badge>
                  <ConfidenceIndicator
                    value={Math.round(query.data.confidence * 100)}
                  />
                </div>
              </div>

              <section>
                <h3 className="text-sm font-semibold">Problem</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {query.data.problem}
                </p>
              </section>

              <section>
                <h3 className="text-sm font-semibold">Evidence</h3>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {query.data.evidence.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section>
                <h3 className="text-sm font-semibold">Reasoning</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {query.data.reasoning}
                </p>
              </section>

              <section className="rounded-lg border p-3">
                <h3 className="text-sm font-semibold">Expected Impact</h3>
                <p className="mt-1 text-sm">{query.data.expectedImpact}</p>
                {query.data.linkedForecastId && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Linked forecast: {query.data.linkedForecastId}
                  </p>
                )}
              </section>

              {query.data.assigneeName && (
                <section>
                  <h3 className="text-sm font-semibold">Assigned to</h3>
                  <p className="text-sm text-muted-foreground">
                    {query.data.assigneeName}
                    {query.data.dueDate && ` · Due ${query.data.dueDate}`}
                  </p>
                </section>
              )}

              <RecommendationActionBar
                orgId={orgId}
                recommendation={query.data}
                onActionComplete={() => onOpenChange(false)}
              />
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
