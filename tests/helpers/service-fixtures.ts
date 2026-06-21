import type { OperationalSnapshot } from "@/services/intelligence/intelligence-types";
import { EMPTY_EXTERNAL_DATA } from "@/services/intelligence/intelligence-types";

export const DEMO_ORG_ID = "00000000-0000-4000-8000-000000000001";
export const DEMO_SITE_ID = "00000000-0000-4000-8000-000000000002";
export const DEMO_USER_ID = "00000000-0000-4000-8000-000000000003";
export const DEMO_FORECAST_ID = "00000000-0000-4000-8000-000000000010";
export const DEMO_REC_ID = "00000000-0000-4000-8000-000000000020";
export const DEMO_SIMULATION_ID = "00000000-0000-4000-8000-000000000030";
export const DEMO_OPPORTUNITY_ID = "00000000-0000-4000-8000-000000000050";
export const DEMO_CONVERSATION_ID = "00000000-0000-4000-8000-000000000060";
export const DEMO_REPORT_ID = "00000000-0000-4000-8000-000000000061";

export function buildOperationalSnapshot(
  overrides: Partial<OperationalSnapshot> = {},
): OperationalSnapshot {
  return {
    organizationId: DEMO_ORG_ID,
    siteId: DEMO_SITE_ID,
    windowDays: 7,
    wasteMeals: [3, 4, 5, 3, 4],
    attendance: [300, 310, 295, 305, 300],
    expirationRiskItems: 5,
    upcomingEvents: [{ name: "Exam Week", expectedAttendance: 280, startDate: new Date() }],
    inventoryUnits: 120,
    purchaseSpend: 2000,
    avgWastePerDay: 3.8,
    avgAttendance: 302,
    wasteTrend: 5,
    attendanceTrend: -2,
    externalData: { ...EMPTY_EXTERNAL_DATA },
    ...overrides,
  };
}

export const mockAuthUser = {
  id: DEMO_USER_ID,
  email: "demo@harvest.local",
  user_metadata: { full_name: "Demo User" },
};
