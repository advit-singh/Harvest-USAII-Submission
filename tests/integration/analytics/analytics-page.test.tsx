import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnalyticsShell } from "@/features/analytics/components/AnalyticsShell";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("tab=waste"),
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

describe("AnalyticsShell", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("shows empty org dashboard when org has no operational data", async () => {
    const { unmount } = renderWithQuery(<AnalyticsShell orgId="org_empty_test" />);

    await waitFor(() => {
      expect(screen.getByText("Welcome to Harvest")).toBeInTheDocument();
    });
    unmount();
  });

  it("renders analytics tabs when operational data exists", async () => {
    const { unmount } = renderWithQuery(<AnalyticsShell orgId="org_demo_123" />);

    await waitFor(
      () => {
        expect(screen.getByRole("tab", { name: /Waste/i })).toBeInTheDocument();
      },
      { timeout: 5000 },
    );

    expect(screen.getByRole("tab", { name: /Inventory/i })).toBeInTheDocument();
    expect(screen.getByLabelText("Time range")).toBeInTheDocument();
    unmount();
  });
});
