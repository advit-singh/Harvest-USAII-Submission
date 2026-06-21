import type { RootCauseAnalysis } from "@/types/analytics";
import { percentOf } from "./analytics-queries";

export interface WasteBreakdownRow {
  name: string;
  value: number;
}

export function buildWasteRootCause(rows: WasteBreakdownRow[]): RootCauseAnalysis {
  const total = rows.reduce((sum, r) => sum + r.value, 0);
  const sorted = [...rows].sort((a, b) => b.value - a.value).slice(0, 4);

  if (total === 0) {
    return {
      drivers: [],
      confidence: 0.5,
      summary: "Insufficient waste data to determine root causes.",
    };
  }

  const drivers = sorted.map((row) => ({
    name: row.name,
    percent: percentOf(row.value, total),
    description: `${row.name} contributed ${percentOf(row.value, total)}% of recorded waste.`,
  }));

  const top = drivers[0];
  return {
    drivers,
    confidence: drivers.length >= 2 ? 0.82 : 0.65,
    summary: top
      ? `${top.name} is the primary driver at ${top.percent}% of total waste in this period.`
      : "No dominant waste driver identified.",
  };
}
