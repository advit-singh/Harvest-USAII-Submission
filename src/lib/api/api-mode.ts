/** When true, forecast/recommendation/simulation/upload clients call live Person A APIs. */
export function isLiveIntelligenceApiEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_LIVE_INTELLIGENCE_API === "true") {
    return true;
  }
  return process.env.NEXT_PUBLIC_USE_MOCK_API === "false";
}

export function isMockApiEnabled(): boolean {
  return !isLiveIntelligenceApiEnabled();
}
