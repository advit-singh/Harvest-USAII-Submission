import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { RootCausePanel } from "@/features/analytics/components/panels/RootCausePanel";
import type { RootCauseAnalysis } from "@/types/analytics";

const mockRootCause: RootCauseAnalysis = {
  drivers: [
    { name: "Weather", percent: 38, description: "Rain reduced attendance" },
    { name: "Attendance Variance", percent: 27 },
    { name: "Menu Preference", percent: 21 },
    { name: "Inventory Expiration", percent: 14 },
  ],
  confidence: 0.86,
  summary: "Waste increased due to weather and attendance drops.",
};

describe("RootCausePanel", () => {
  it("renders driver names and percentages", () => {
    render(<RootCausePanel rootCause={mockRootCause} />);

    expect(screen.getByText("Waste Increase Drivers")).toBeInTheDocument();
    expect(screen.getByText("Weather")).toBeInTheDocument();
    expect(screen.getByText("38%")).toBeInTheDocument();
    expect(screen.getByText(mockRootCause.summary)).toBeInTheDocument();
  });

  it("returns null when no drivers", () => {
    const { container } = render(
      <RootCausePanel rootCause={{ drivers: [], confidence: 0, summary: "" }} />,
    );
    expect(container.firstChild).toBeNull();
  });
});
