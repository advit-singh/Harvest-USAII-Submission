import type { ImpactTimeRange } from "@/types/impact";

export interface GetImpactMetricsInput {
  organizationId: string;
  timeRange: ImpactTimeRange;
  siteId?: string;
}

export interface RecordImpactDeltaInput {
  organizationId: string;
  delta: {
    mealsSaved: number;
    foodDivertedKg: number;
    moneySaved: number;
    co2AvoidedKg: number;
    waterSavedLiters?: number;
    peopleServed?: number;
  };
  createdBy?: string;
}

export interface TimeRangeBounds {
  start: Date;
  end: Date;
  label: string;
}
