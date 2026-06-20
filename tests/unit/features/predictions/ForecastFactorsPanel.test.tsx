import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ForecastFactorsPanel } from "@/features/predictions/components/explorer/ForecastFactorsPanel";

describe("ForecastFactorsPanel", () => {
  it("renders factor table with weights", () => {
    render(
      <ForecastFactorsPanel
        factors={[
          {
            name: "Rain Forecast",
            impactWeight: 0.34,
            description: "Expected attendance reduction",
          },
        ]}
      />,
    );

    expect(screen.getByText("Rain Forecast")).toBeInTheDocument();
    expect(screen.getByText("34%")).toBeInTheDocument();
    expect(screen.getByText("Expected attendance reduction")).toBeInTheDocument();
  });

  it("shows empty message when no factors", () => {
    render(<ForecastFactorsPanel factors={[]} />);
    expect(
      screen.getByText(/No contributing factors available/i),
    ).toBeInTheDocument();
  });
});
