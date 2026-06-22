import type { TooltipProps } from "recharts";

interface ChartTooltipProps extends TooltipProps<number, string> {
  valueLabel?: string;
  unit?: string;
}

export function ChartTooltip({
  active,
  payload,
  label,
  valueLabel = "Value",
  unit,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  const entry = payload[0];
  const displayValue =
    entry.value != null
      ? `${entry.value}${unit ? ` ${unit}` : ""}`
      : "";

  return (
    <div className="rounded-md border bg-card px-3 py-2 text-xs shadow-md">
      {label != null && (
        <p className="mb-1 font-medium text-foreground">{String(label)}</p>
      )}
      <p className="text-muted-foreground">
        {entry.name ?? valueLabel}:{" "}
        <span className="font-medium text-foreground">{displayValue}</span>
      </p>
    </div>
  );
}
