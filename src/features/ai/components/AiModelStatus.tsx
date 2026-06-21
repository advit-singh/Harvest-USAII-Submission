"use client";

import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  getLlmInitState,
  getLocalLlmEngine,
  subscribeLlmInit,
  type LlmInitState,
} from "@/lib/ai/local/web-llm-engine";

export function AiModelStatus() {
  const [state, setState] = useState<LlmInitState>(getLlmInitState);

  useEffect(() => {
    return subscribeLlmInit(setState);
  }, []);

  useEffect(() => {
    void getLocalLlmEngine().catch(() => undefined);
  }, []);

  if (state.status === "ready") {
    return (
      <Badge variant="secondary" className="gap-1">
        <Sparkles className="h-3 w-3" aria-hidden />
        Local AI ready
      </Badge>
    );
  }

  if (state.status === "loading") {
    return (
      <Badge variant="outline" className="gap-1">
        <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
        Loading AI {state.progress}%
      </Badge>
    );
  }

  if (state.status === "error") {
    return (
      <Badge variant="destructive" className="gap-1">
        AI unavailable
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="gap-1">
      <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
      Preparing AI…
    </Badge>
  );
}
