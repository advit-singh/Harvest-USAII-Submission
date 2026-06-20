import { generateAllForecastTypes } from "@/services/forecast/forecast-service";

export async function refreshSiteIntelligence(
  organizationId: string,
  siteId: string,
  createdBy?: string,
): Promise<void> {
  try {
    await generateAllForecastTypes(organizationId, siteId, createdBy);
  } catch (error) {
    console.error("Intelligence refresh failed:", error);
  }
}
