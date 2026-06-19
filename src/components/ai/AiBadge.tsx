import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AiBadgeProps {
  className?: string;
  label?: string;
}

export function AiBadge({ className, label = "AI" }: AiBadgeProps) {
  return (
    <Badge variant="ai" className={cn("gap-1", className)}>
      <Sparkles className="h-3 w-3" aria-hidden />
      {label}
    </Badge>
  );
}
