/** API_SPEC §26 analytics/inventory */

export type InventoryHealthStatus = "healthy" | "warning" | "critical";

export interface InventoryHealth {
  status: InventoryHealthStatus;
  expiringItems: number;
  utilizationPercent: number;
  storageCapacityPercent: number;
  topAlerts: string[];
}
