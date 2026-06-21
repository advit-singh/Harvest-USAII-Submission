export const CHART_PRIMARY = "hsl(var(--primary))";
export const CHART_PRIMARY_SOFT = "hsla(var(--primary) / 0.15)";

export const chartMargins = {
  default: { top: 8, right: 12, left: 8, bottom: 8 },
  withXLabel: { top: 8, right: 12, left: 8, bottom: 28 },
  withYLabel: { top: 8, right: 12, left: 44, bottom: 8 },
  withBothLabels: { top: 8, right: 12, left: 44, bottom: 28 },
};

export function resolveChartMargin(yAxisLabel?: string, xAxisLabel?: string) {
  if (yAxisLabel && xAxisLabel) return chartMargins.withBothLabels;
  if (yAxisLabel) return chartMargins.withYLabel;
  if (xAxisLabel) return chartMargins.withXLabel;
  return chartMargins.default;
}
