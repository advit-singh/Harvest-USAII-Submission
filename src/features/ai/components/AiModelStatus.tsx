"use client";

import { Sparkles, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { isGeminiConfigured } from "@/lib/ai/gemini-client";

export function AiModelStatus() {
  if (isGeminiConfigured()) {
    return (
      <Badge variant="secondary" className="gap-1">
        <Sparkles className="h-3 w-3" aria-hidden />
        Gemini ready
      </Badge>
    );
  }

  return (
    <Badge variant="destructive" className="gap-1">
      <AlertCircle className="h-3 w-3" aria-hidden />
      API key missing
    </Badge>
  );
}
