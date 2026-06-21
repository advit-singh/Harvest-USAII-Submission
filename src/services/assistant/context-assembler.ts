import type { RetrievalBundle } from "./assistant-types";
import type { AssembledContext } from "./assistant-types";

const MAX_CONTEXT_CHARS = 6000;

export function assembleAssistantContext(bundle: RetrievalBundle): AssembledContext {
  const sections = [
    `WASTE: ${bundle.wasteSummary}`,
    `INVENTORY: ${bundle.inventorySummary}`,
    `ATTENDANCE: ${bundle.attendanceSummary}`,
    `FORECASTS: ${bundle.forecastSummary}`,
    `RECOMMENDATIONS: ${bundle.recommendationSummary}`,
    `DONATIONS: ${bundle.donationSummary}`,
    `IMPACT: ${bundle.impactSummary}`,
  ];

  let promptContext = sections.join("\n");
  if (promptContext.length > MAX_CONTEXT_CHARS) {
    promptContext = `${promptContext.slice(0, MAX_CONTEXT_CHARS)}\n[context truncated]`;
  }

  return {
    promptContext,
    citations: bundle.citations,
  };
}
