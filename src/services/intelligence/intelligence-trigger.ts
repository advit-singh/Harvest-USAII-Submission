import { syncDonationOpportunities } from "@/services/donation/donation-opportunity-service";
import { generateAllForecastTypes } from "@/services/forecast/forecast-service";
import { recomputeImpactSnapshot } from "@/services/impact/impact-service";
import { notifyForecastGenerated } from "@/services/notification/notification-emitter";

export async function refreshSiteIntelligence(
  organizationId: string,
  siteId: string,
  createdBy?: string,
): Promise<void> {
  try {
    await generateAllForecastTypes(organizationId, siteId, createdBy);
    await syncDonationOpportunities({ organizationId, siteId, createdBy });
    await recomputeImpactSnapshot(organizationId, siteId);
    if (createdBy) {
      void notifyForecastGenerated({ organizationId, userId: createdBy });
    }
  } catch (error) {
    console.error("Intelligence refresh failed:", error);
  }
}
