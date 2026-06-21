import { apiClient } from "@/lib/api/client";
import { isMockApiEnabled } from "@/lib/api/api-mode";
import type { SearchResults } from "@/services/search/search-service";

export async function searchOrg(
  organizationId: string,
  query: string,
): Promise<SearchResults> {
  if (isMockApiEnabled()) {
    const q = query.toLowerCase();
    return {
      inventory: q.includes("milk")
        ? [
            {
              id: "inv_001",
              type: "inventory",
              title: "Whole Milk",
              subtitle: "Dairy",
              href: "/analytics?tab=inventory",
            },
          ]
        : [],
      forecasts: q.includes("waste") || q.includes("forecast")
        ? [
            {
              id: "fc_001",
              type: "forecast",
              title: "Waste Forecast",
              href: "/predictions?tab=explorer",
            },
          ]
        : [],
      reports: [],
      recommendations: [],
      uploads: q.includes("upload")
        ? [{ id: "upl_001", type: "upload", title: "March inventory.csv", href: "/uploads" }]
        : [],
      conversations: [],
    };
  }

  const params = new URLSearchParams({ organizationId, q: query });
  return apiClient<SearchResults>(`/search?${params.toString()}`);
}
