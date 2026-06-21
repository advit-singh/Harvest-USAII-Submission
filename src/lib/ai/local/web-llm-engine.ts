"use client";

import type { InitProgressReport } from "@mlc-ai/web-llm";
import {
  LOCAL_LLM_FALLBACK_MODEL_ID,
  LOCAL_LLM_MODEL_ID,
} from "@/lib/ai/local/model-config";

export type LlmInitStatus = "idle" | "loading" | "ready" | "error";

export interface LlmInitState {
  status: LlmInitStatus;
  progress: number;
  text: string;
  modelId: string | null;
  error: string | null;
}

type ProgressListener = (state: LlmInitState) => void;

let enginePromise: Promise<import("@mlc-ai/web-llm").MLCEngine> | null = null;
let initState: LlmInitState = {
  status: "idle",
  progress: 0,
  text: "",
  modelId: null,
  error: null,
};
const listeners = new Set<ProgressListener>();

function notify() {
  listeners.forEach((listener) => listener({ ...initState }));
}

function setInitState(partial: Partial<LlmInitState>) {
  initState = { ...initState, ...partial };
  notify();
}

export function subscribeLlmInit(listener: ProgressListener): () => void {
  listeners.add(listener);
  listener({ ...initState });
  return () => listeners.delete(listener);
}

export function getLlmInitState(): LlmInitState {
  return { ...initState };
}

async function loadEngine(modelId: string) {
  const { CreateMLCEngine } = await import("@mlc-ai/web-llm");

  setInitState({ status: "loading", progress: 0, text: "Starting model download…", modelId });

  const engine = await CreateMLCEngine(modelId, {
    initProgressCallback: (report: InitProgressReport) => {
      setInitState({
        status: "loading",
        progress: Math.round(report.progress * 100),
        text: report.text,
        modelId,
      });
    },
  });

  setInitState({
    status: "ready",
    progress: 100,
    text: "Model ready",
    modelId,
    error: null,
  });

  return engine;
}

export async function getLocalLlmEngine(): Promise<import("@mlc-ai/web-llm").MLCEngine> {
  if (typeof window === "undefined") {
    throw new Error("Local LLM is only available in the browser.");
  }

  if (enginePromise) return enginePromise;

  enginePromise = loadEngine(LOCAL_LLM_MODEL_ID).catch(async (primaryError) => {
    enginePromise = null;
    try {
      enginePromise = loadEngine(LOCAL_LLM_FALLBACK_MODEL_ID);
      return enginePromise;
    } catch {
      setInitState({
        status: "error",
        error:
          primaryError instanceof Error
            ? primaryError.message
            : "Failed to load local AI model",
      });
      throw primaryError;
    }
  });

  return enginePromise;
}

export function resetLocalLlmEngine(): void {
  enginePromise = null;
  initState = {
    status: "idle",
    progress: 0,
    text: "",
    modelId: null,
    error: null,
  };
  notify();
}
