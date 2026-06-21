import { syncDonationOpportunities } from "@/services/donation/donation-opportunity-service";
import { generateAllForecastTypes } from "@/services/forecast/forecast-service";
import { recomputeImpactSnapshot } from "@/services/impact/impact-service";
import { notifyForecastGenerated } from "@/services/notification/notification-emitter";

export interface IntelligenceRefreshResult {
  forecastsGenerated: number;
  opportunitiesSynced: number;
  impactRecomputed: boolean;
}

export async function refreshSiteIntelligence(
  organizationId: string,
  siteId: string,
  createdBy?: string,
): Promise<IntelligenceRefreshResult> {
  const result: IntelligenceRefreshResult = {
    forecastsGenerated: 0,
    opportunitiesSynced: 0,
    impactRecomputed: false,
  };

  try {
    await generateAllForecastTypes(organizationId, siteId, createdBy);
    result.forecastsGenerated = 3;

    result.opportunitiesSynced = await syncDonationOpportunities({
      organizationId,
      siteId,
      createdBy,
    });

    await recomputeImpactSnapshot(organizationId, siteId);
    result.impactRecomputed = true;

    if (createdBy) {
      void notifyForecastGenerated({ organizationId, userId: createdBy });
    }
  } catch (error) {
    console.error("Intelligence refresh failed:", {
      organizationId,
      siteId,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  return result;
}
