import { apiClient } from "@/lib/api/client";
import { getMockDonationOpportunities } from "@/lib/mocks/dashboard-fixtures";
import {
  completeMockDonation,
  dismissMockOpportunity,
  getMockDonationHistory,
  getMockDonationMatch,
  getMockOpportunityById,
  recordMockDonationFailure,
} from "@/lib/mocks/rescue-fixtures";
import type {
  DismissDonationPayload,
  DismissDonationResult,
  DonationCompletionPayload,
  DonationCompletionResult,
  DonationMatchResult,
  DonationOpportunity,
  DonationRecord,
} from "@/types/donation";
import type { DonationHistoryFilters } from "@/types/rescue";

export async function fetchDonationOpportunities(
  orgId: string,
): Promise<DonationOpportunity[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_API !== "false") {
    await new Promise((r) => setTimeout(r, 200));
    return getMockDonationOpportunities();
  }

  return apiClient<DonationOpportunity[]>(
    `/donations/opportunities?organizationId=${orgId}`,
  );
}

export async function fetchDonationOpportunityById(
  id: string,
): Promise<DonationOpportunity> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_API !== "false") {
    await new Promise((r) => setTimeout(r, 150));
    const opp = getMockOpportunityById(id);
    if (!opp) {
      throw new Error(`Opportunity not found: ${id}`);
    }
    return opp;
  }

  return apiClient<DonationOpportunity>(`/donations/opportunities/${id}`);
}

export async function matchDonationOpportunity(
  opportunityId: string,
): Promise<DonationMatchResult> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_API !== "false") {
    await new Promise((r) => setTimeout(r, 400));
    return getMockDonationMatch(opportunityId);
  }

  return apiClient<DonationMatchResult>(
    `/donations/opportunities/${opportunityId}/match`,
    { method: "POST" },
  );
}

export async function completeDonation(
  opportunityId: string,
  payload: DonationCompletionPayload,
): Promise<DonationCompletionResult> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_API !== "false") {
    await new Promise((r) => setTimeout(r, 300));
    const result = completeMockDonation(
      opportunityId,
      payload.recipientId,
    );
    if (!result) {
      throw new Error("Failed to complete donation");
    }
    return result;
  }

  return apiClient<DonationCompletionResult>(
    `/donations/${opportunityId}/complete`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function dismissDonationOpportunity(
  opportunityId: string,
  payload?: DismissDonationPayload,
): Promise<DismissDonationResult> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_API !== "false") {
    await new Promise((r) => setTimeout(r, 200));
    const result = dismissMockOpportunity(opportunityId);
    if (!result) {
      throw new Error(`Opportunity not found: ${opportunityId}`);
    }
    return { id: opportunityId, status: "dismissed" };
  }

  return apiClient<DismissDonationResult>(
    `/donations/opportunities/${opportunityId}/dismiss`,
    {
      method: "POST",
      body: JSON.stringify(payload ?? {}),
    },
  );
}

export async function fetchDonationHistory(
  orgId: string,
  filters: DonationHistoryFilters,
): Promise<DonationRecord[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_API !== "false") {
    await new Promise((r) => setTimeout(r, 200));
    return getMockDonationHistory(orgId, filters);
  }

  const params = new URLSearchParams({
    organizationId: orgId,
    status: filters.status,
    siteId: filters.siteId,
  });

  return apiClient<DonationRecord[]>(`/donations?${params.toString()}`);
}

export async function recordDonationFailure(
  opportunityId: string,
  recipientId: string,
  reason: string,
): Promise<DonationRecord> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_API !== "false") {
    await new Promise((r) => setTimeout(r, 200));
    const record = recordMockDonationFailure(
      opportunityId,
      recipientId,
      reason,
    );
    if (!record) {
      throw new Error("Failed to record donation failure");
    }
    return record;
  }

  return apiClient<DonationRecord>(
    `/donations/${opportunityId}/fail`,
    {
      method: "POST",
      body: JSON.stringify({ recipientId, reason }),
    },
  );
}
