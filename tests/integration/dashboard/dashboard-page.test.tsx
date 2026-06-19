import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe("DashboardShell", () => {
  it("shows empty org dashboard when org has no operational data", async () => {
    renderWithQuery(<DashboardShell orgId="org_empty_test" />);

    await waitFor(() => {
      expect(screen.getByText("Welcome to Project Harvest")).toBeInTheDocument();
    });
  });

  it("renders dashboard widgets when operational data exists", async () => {
    renderWithQuery(<DashboardShell orgId="org_demo_123" />);

    await waitFor(() => {
      expect(screen.getByText("High Waste Risk")).toBeInTheDocument();
    });

    expect(screen.getByText("Reset layout")).toBeInTheDocument();
  });
});
