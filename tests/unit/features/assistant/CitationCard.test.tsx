import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CitationCard } from "@/features/assistant/components/CitationCard";
import type { AssistantCitation } from "@/types/assistant";

const citation: AssistantCitation = {
  id: "cite_test",
  sourceType: "forecast",
  title: "Surplus forecast",
  excerpt: "47 surplus meals projected.",
  href: "/predictions?tab=explorer",
  confidence: 0.82,
};

describe("CitationCard", () => {
  it("renders citation details and source link", () => {
    render(<CitationCard citation={citation} />);

    expect(screen.getByText("Surplus forecast")).toBeInTheDocument();
    expect(screen.getByText(/47 surplus meals/)).toBeInTheDocument();
    expect(screen.getByText("Forecast")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /View source/i })).toHaveAttribute(
      "href",
      "/predictions?tab=explorer",
    );
  });
});
