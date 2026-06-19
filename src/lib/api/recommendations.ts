import { apiClient } from "@/lib/api/client";
import {
  getMockRecommendations,
  updateMockRecommendationAction,
} from "@/lib/mocks/dashboard-fixtures";
import type {
  Recommendation,
  RecommendationActionInput,
} from "@/types/recommendation";

export interface RecommendationFilters {
  orgId: string;
  status?: string;
  limit?: number;
}

export async function fetchRecommendations(
  filters: RecommendationFilters,
): Promise<Recommendation[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_API !== "false") {
    await new Promise((r) => setTimeout(r, 200));
    const items = getMockRecommendations();
    return filters.limit ? items.slice(0, filters.limit) : items;
  }

  const params = new URLSearchParams({ organizationId: filters.orgId });
  if (filters.status) params.set("status", filters.status);
  if (filters.limit) params.set("limit", String(filters.limit));

  return apiClient<Recommendation[]>(
    `/recommendations?${params.toString()}`,
  );
}

export async function submitRecommendationAction(
  id: string,
  input: RecommendationActionInput,
): Promise<Recommendation> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_API !== "false") {
    await new Promise((r) => setTimeout(r, 150));
    const updated = updateMockRecommendationAction(id, input.action);
    if (!updated) {
      throw new Error("Recommendation not found");
    }
    return updated;
  }

  return apiClient<Recommendation>(`/recommendations/${id}/action`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}
