"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { RecommendedAction } from "@/types/assistant";

interface RecommendedActionsProps {
  actions: RecommendedAction[];
}

export function RecommendedActions({ actions }: RecommendedActionsProps) {
  return (
    <div className="mt-4 border-t border-[var(--color-ai-border)] pt-3">
      <p className="mb-2 text-xs font-medium text-muted-foreground">
        Recommended next steps
      </p>
      <ul className="space-y-2">
        {actions.map((action) => (
          <li key={action.id}>
            <Link
              href={action.href}
              className="flex items-center justify-between rounded-md border bg-background px-3 py-2 text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span>
                <span className="font-medium">{action.label}</span>
                {action.description && (
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {action.description}
                  </span>
                )}
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
