import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WasteRiskWidget } from "@/features/dashboard/components/widgets/WasteRiskWidget";

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe("WasteRiskWidget", () => {
  it("renders risk data from mock API", async () => {
    renderWithQuery(<WasteRiskWidget orgId="org_demo_123" />);

    await waitFor(() => {
      expect(screen.getByText("High Waste Risk")).toBeInTheDocument();
    });

    expect(screen.getByText(/Rain Forecast/)).toBeInTheDocument();
    expect(screen.getByText(/Score 82/)).toBeInTheDocument();
  });
});
