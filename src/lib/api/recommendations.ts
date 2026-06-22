import { apiClient } from "@/lib/api/client";
import { isLiveIntelligenceApiEnabled } from "@/lib/api/api-mode";
import {
  resolveIntelligenceOrgId,
  resolveIntelligenceSiteId,
} from "@/lib/api/intelligence-org-bridge";
import {
  getMockRecommendations,
  updateMockRecommendationAction,
} from "@/lib/mocks/dashboard-fixtures";
import { getMockRecommendationDetail } from "@/lib/mocks/predictions-fixtures";
import type {
  Recommendation,
  RecommendationActionInput,
  RecommendationAssignInput,
  RecommendationDetail,
} from "@/types/recommendation";

export interface RecommendationFilters {
  orgId: string;
  status?: string;
  priority?: string;
  siteId?: string;
  limit?: number;
}

const mockAssignments: Record<
  string,
  { assigneeId: string; assigneeName: string; dueDate: string | null }
> = {};

export async function fetchRecommendations(
  filters: RecommendationFilters,
): Promise<Recommendation[]> {
  if (!isLiveIntelligenceApiEnabled()) {
    await new Promise((r) => setTimeout(r, 200));
    let items = getMockRecommendations(filters.orgId);

    if (filters.status && filters.status !== "all" && filters.status !== "open") {
      items = items.filter((r) => r.status === filters.status);
    }

    if (filters.priority && filters.priority !== "all") {
      items = items.filter((r) => r.priority === filters.priority);
    }

    if (filters.siteId) {
      items = items.filter((r) => r.siteId === filters.siteId);
    }

    if (filters.status === "all") {
      items = ["rec_001", "rec_002", "rec_003"]
        .map((id) => getMockRecommendationDetail(id, filters.orgId))
        .filter((r): r is RecommendationDetail => r !== null);
    }

    const sorted = [...items].sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    return filters.limit ? sorted.slice(0, filters.limit) : sorted;
  }

  const params = new URLSearchParams({
    organizationId: resolveIntelligenceOrgId(filters.orgId),
  });
  if (filters.status) params.set("status", filters.status);
  if (filters.priority) params.set("priority", filters.priority);
  if (filters.siteId) params.set("siteId", resolveIntelligenceSiteId(filters.siteId));
  if (filters.limit) params.set("limit", String(filters.limit));

  return apiClient<Recommendation[]>(
    `/recommendations?${params.toString()}`,
  );
}

export async function fetchRecommendationById(
  id: string,
): Promise<RecommendationDetail> {
  if (!isLiveIntelligenceApiEnabled()) {
    await new Promise((r) => setTimeout(r, 150));
    const detail = getMockRecommendationDetail(id);
    if (!detail) {
      throw new Error("Recommendation not found");
    }
    const assignment = mockAssignments[id];
    if (assignment) {
      return {
        ...detail,
        assigneeId: assignment.assigneeId,
        assigneeName: assignment.assigneeName,
        dueDate: assignment.dueDate,
      };
    }
    return detail;
  }

  return apiClient<RecommendationDetail>(`/recommendations/${id}`);
}

export async function submitRecommendationAction(
  id: string,
  input: RecommendationActionInput,
): Promise<Recommendation> {
  if (!isLiveIntelligenceApiEnabled()) {
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

export async function assignRecommendation(
  id: string,
  input: RecommendationAssignInput,
): Promise<RecommendationDetail> {
  if (!isLiveIntelligenceApiEnabled()) {
    await new Promise((r) => setTimeout(r, 200));
    const detail = getMockRecommendationDetail(id);
    if (!detail) {
      throw new Error("Recommendation not found");
    }
    const { MOCK_TEAM_MEMBERS } = await import(
      "@/features/predictions/config/predictions-tabs"
    );
    const member = MOCK_TEAM_MEMBERS.find((m) => m.id === input.assigneeId);
    mockAssignments[id] = {
      assigneeId: input.assigneeId,
      assigneeName: member?.name ?? "Team member",
      dueDate: input.dueDate ?? null,
    };
    return {
      ...detail,
      assigneeId: input.assigneeId,
      assigneeName: member?.name ?? "Team member",
      dueDate: input.dueDate ?? null,
    };
  }

  return apiClient<RecommendationDetail>(`/recommendations/${id}/assign`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}
