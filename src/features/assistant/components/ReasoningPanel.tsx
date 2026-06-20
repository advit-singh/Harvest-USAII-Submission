"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReasoningPanelProps {
  reasoning: string;
}

export function ReasoningPanel({ reasoning }: ReasoningPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-3 border-t border-[var(--color-ai-border)] pt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-1 text-left text-xs font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-expanded={open}
      >
        {open ? (
          <ChevronDown className="h-3.5 w-3.5" aria-hidden />
        ) : (
          <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        )}
        Reasoning
      </button>
      {open && (
        <p
          className={cn(
            "mt-2 text-xs leading-relaxed text-muted-foreground",
          )}
        >
          {reasoning}
        </p>
      )}
    </div>
  );
}
