export const predictionsKeys = {
  all: ["predictions"] as const,
  summary: (orgId: string) =>
    [...predictionsKeys.all, "summary", orgId] as const,
};

export const forecastKeys = {
  all: ["forecasts"] as const,
  list: (orgId: string, filters?: Record<string, string | undefined>) =>
    [...forecastKeys.all, orgId, filters] as const,
  detail: (id: string) => [...forecastKeys.all, "detail", id] as const,
};

export const recommendationKeys = {
  all: ["recommendations"] as const,
  list: (orgId: string, filters?: Record<string, string | undefined>) =>
    [...recommendationKeys.all, orgId, filters] as const,
  detail: (id: string) => [...recommendationKeys.all, "detail", id] as const,
};

export const simulationKeys = {
  all: ["simulations"] as const,
  list: (orgId: string) => [...simulationKeys.all, orgId] as const,
  result: (id: string) => [...simulationKeys.all, "result", id] as const,
  compare: (ids: string[]) =>
    [...simulationKeys.all, "compare", ...ids.sort()] as const,
};
