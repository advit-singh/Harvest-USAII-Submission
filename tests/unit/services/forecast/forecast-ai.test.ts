import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildOperationalSnapshot } from "../../../helpers/service-fixtures";
import { computeForecast } from "@/services/forecast/forecast-models";

vi.mock("@/lib/ai/openrouter-client", () => ({
  isOpenRouterConfigured: vi.fn(() => false),
  callOpenRouter: vi.fn(),
}));

import { enrichForecastWithAi } from "@/services/forecast/forecast-ai";
import { isOpenRouterConfigured, callOpenRouter } from "@/lib/ai/openrouter-client";

describe("forecast-ai", () => {
  beforeEach(() => {
    vi.mocked(isOpenRouterConfigured).mockReturnValue(false);
  });

  it("returns computation unchanged when OpenRouter is not configured", async () => {
    const snapshot = buildOperationalSnapshot();
    const computation = computeForecast("surplus", snapshot, 7);
    const result = await enrichForecastWithAi(computation, snapshot);
    expect(result).toEqual(computation);
  });

  it("enriches computation when AI returns valid reasoning", async () => {
    vi.mocked(isOpenRouterConfigured).mockReturnValue(true);
    vi.mocked(callOpenRouter).mockResolvedValue({
      content: JSON.stringify({
        explanation: "AI-enriched explanation",
        factors: [{ name: "Weather", impactWeight: 0.3, description: "Cold week" }],
      }),
      model: "google/gemini-2.0-flash-001",
    });

    const snapshot = buildOperationalSnapshot();
    const computation = computeForecast("surplus", snapshot, 7);
    const result = await enrichForecastWithAi(computation, snapshot);

    expect(result.explanation).toBe("AI-enriched explanation");
    expect(result.factors.some((f) => f.name === "Weather")).toBe(true);
    expect(result.confidence).toBeGreaterThanOrEqual(computation.confidence);
  });

  it("falls back on AI failure", async () => {
    vi.mocked(isOpenRouterConfigured).mockReturnValue(true);
    vi.mocked(callOpenRouter).mockRejectedValue(new Error("AI timeout"));

    const snapshot = buildOperationalSnapshot();
    const computation = computeForecast("surplus", snapshot, 7);
    const result = await enrichForecastWithAi(computation, snapshot);
    expect(result.explanation).toBe(computation.explanation);
  });
});
