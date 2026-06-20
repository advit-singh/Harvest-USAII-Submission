import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RecommendationActionBar } from "@/features/predictions/components/recommendations/RecommendationActionBar";
import type { Recommendation } from "@/types/recommendation";

const mockRec: Recommendation = {
  id: "rec_001",
  title: "Reduce milk order",
  description: "Test",
  impact: "Save meals",
  confidence: 0.9,
  priority: "high",
  status: "open",
  siteId: "site_001",
  siteName: "Test Site",
  createdAt: new Date().toISOString(),
};

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe("RecommendationActionBar", () => {
  it("renders action buttons for open recommendations", () => {
    renderWithQuery(
      <RecommendationActionBar orgId="org_demo_123" recommendation={mockRec} />,
    );

    expect(screen.getByRole("button", { name: "Accept" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reject" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Snooze" })).toBeInTheDocument();
  });

  it("shows status badge for non-open recommendations", () => {
    renderWithQuery(
      <RecommendationActionBar
        orgId="org_demo_123"
        recommendation={{ ...mockRec, status: "accepted" }}
      />,
    );

    expect(screen.getByText("accepted")).toBeInTheDocument();
  });
});
