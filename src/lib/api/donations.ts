import { apiClient } from "@/lib/api/client";
import { getMockDonationOpportunities } from "@/lib/mocks/dashboard-fixtures";
import type { DonationOpportunity } from "@/types/donation";

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
