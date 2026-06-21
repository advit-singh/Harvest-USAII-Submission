import { describe, expect, it, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const result = render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
  return { ...result, queryClient };
}

describe("DashboardShell", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows empty org dashboard when org has no operational data", async () => {
    const { unmount } = renderWithQuery(<DashboardShell orgId="org_empty_test" />);

    await waitFor(() => {
      expect(screen.getByText("Welcome to Harvest")).toBeInTheDocument();
    });
    unmount();
  });

  it("renders dashboard widgets when operational data exists", async () => {
    const { unmount } = renderWithQuery(<DashboardShell orgId="org_demo_123" />);

    await waitFor(() => {
      expect(screen.getByText("High Waste Risk")).toBeInTheDocument();
    });

    expect(screen.getByText("Reset layout")).toBeInTheDocument();
    unmount();
  });
});
