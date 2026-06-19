import { apiClient } from "@/lib/api/client";
import { getMockInventoryHealth } from "@/lib/mocks/dashboard-fixtures";
import type { InventoryHealth } from "@/types/inventory";

export async function fetchInventoryHealth(
  orgId: string,
): Promise<InventoryHealth> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_API !== "false") {
    await new Promise((r) => setTimeout(r, 200));
    return getMockInventoryHealth();
  }

  return apiClient<InventoryHealth>(
    `/analytics/inventory?organizationId=${orgId}`,
  );
}
