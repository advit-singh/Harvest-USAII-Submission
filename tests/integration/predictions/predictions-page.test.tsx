import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PredictionsShell } from "@/features/predictions/components/PredictionsShell";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("tab=summary"),
  useRouter: () => ({
    replace: vi.fn(),
  }),
}));

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const result = render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
  return { ...result, queryClient };
}

describe("PredictionsShell", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("shows empty org dashboard when org has no operational data", async () => {
    const { unmount } = renderWithQuery(
      <PredictionsShell orgId="org_empty_test" />,
    );

    await waitFor(() => {
      expect(screen.getByText("Welcome to Project Harvest")).toBeInTheDocument();
    });
    unmount();
  });

  it("renders predictions tabs when operational data exists", async () => {
    const { unmount } = renderWithQuery(
      <PredictionsShell orgId="org_demo_123" />,
    );

    await waitFor(
      () => {
        expect(screen.getByRole("tab", { name: /Summary/i })).toBeInTheDocument();
      },
      { timeout: 5000 },
    );

    expect(screen.getByRole("tab", { name: /Explorer/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Recommendations/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Simulator/i })).toBeInTheDocument();
    expect(screen.getByLabelText("Generate forecast")).toBeInTheDocument();
    unmount();
  });
});
