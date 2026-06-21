import { syncDonationOpportunities } from "@/services/donation/donation-opportunity-service";
import { generateAllForecastTypes } from "@/services/forecast/forecast-service";
import { recomputeImpactSnapshot } from "@/services/impact/impact-service";

export async function refreshSiteIntelligence(
  organizationId: string,
  siteId: string,
  createdBy?: string,
): Promise<void> {
  try {
    await generateAllForecastTypes(organizationId, siteId, createdBy);
    await syncDonationOpportunities({ organizationId, siteId, createdBy });
    await recomputeImpactSnapshot(organizationId, siteId);
  } catch (error) {
    console.error("Intelligence refresh failed:", error);
  }
}
