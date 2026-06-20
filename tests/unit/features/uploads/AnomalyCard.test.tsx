import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AnomalyCard } from "@/features/uploads/components/validation/AnomalyCard";

vi.mock("@/features/uploads/hooks/useUploads", () => ({
  useResolveAnomaly: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

describe("AnomalyCard", () => {
  it("renders anomaly details and actions", () => {
    render(
      <AnomalyCard
        orgId="org_demo_123"
        fileName="inventory-march.csv"
        anomaly={{
          id: "anom_001",
          uploadId: "upl_001",
          type: "inventory_conflict",
          severity: "warning",
          reason: "Quantity exceeds typical usage.",
          confidence: 0.82,
          suggestedFix: "Verify count.",
          status: "open",
        }}
      />,
    );

    expect(screen.getByText(/inventory conflict/i)).toBeInTheDocument();
    expect(screen.getByText(/Quantity exceeds typical usage/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Accept/i })).toBeInTheDocument();
  });
});
