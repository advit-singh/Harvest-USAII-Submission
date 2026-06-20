import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MatchFactorsPanel } from "@/features/rescue/components/matching/MatchFactorsPanel";

describe("MatchFactorsPanel", () => {
  it("renders reasoning and factors", () => {
    render(
      <MatchFactorsPanel
        reasoning="Strong distance and capacity match."
        factors={[
          { label: "Distance", value: "2.4 km" },
          { label: "Capacity", value: "120 meals" },
        ]}
      />,
    );

    expect(screen.getByText("Match reasoning")).toBeInTheDocument();
    expect(
      screen.getByText("Strong distance and capacity match."),
    ).toBeInTheDocument();
    expect(screen.getByText("Distance")).toBeInTheDocument();
    expect(screen.getByText("2.4 km")).toBeInTheDocument();
  });
});
