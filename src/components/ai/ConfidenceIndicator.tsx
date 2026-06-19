import { cn } from "@/lib/utils";

interface ConfidenceIndicatorProps {
  value: number;
  className?: string;
  showLabel?: boolean;
}

export function ConfidenceIndicator({
  value,
  className,
  showLabel = true,
}: ConfidenceIndicatorProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const level =
    clamped >= 80 ? "high" : clamped >= 50 ? "medium" : "low";

  const colorClass =
    level === "high"
      ? "bg-[var(--color-success)]"
      : level === "medium"
        ? "bg-[var(--color-warning)]"
        : "bg-[var(--color-danger)]";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className="h-2 w-20 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Confidence ${clamped}%`}
      >
        <div
          className={cn("h-full transition-all", colorClass)}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-muted-foreground">{clamped}%</span>
      )}
    </div>
  );
}
