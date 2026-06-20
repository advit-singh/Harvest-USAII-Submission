import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { OpportunityPriorityBadge } from "@/features/rescue/components/opportunities/OpportunityPriorityBadge";

describe("OpportunityPriorityBadge", () => {
  it("renders priority and score", () => {
    render(<OpportunityPriorityBadge priority="high" score={92} />);
    expect(screen.getByText(/high/i)).toBeInTheDocument();
    expect(screen.getByText(/\(92\)/)).toBeInTheDocument();
  });
});
