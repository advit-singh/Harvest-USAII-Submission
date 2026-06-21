/** When true, all API clients call live backends. */
export function isMockApiEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_API !== "false";
}

/** When true, forecast/recommendation/simulation/upload clients call live Person A APIs. */
export function isLiveIntelligenceApiEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_USE_MOCK_API === "false") {
    return true;
  }
  return process.env.NEXT_PUBLIC_LIVE_INTELLIGENCE_API === "true";
}
