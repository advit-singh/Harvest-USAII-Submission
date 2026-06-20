import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AssistantResponseCard } from "@/features/assistant/components/AssistantResponseCard";
import type { AssistantChatResponse } from "@/types/assistant";

const mockResponse: AssistantChatResponse = {
  answer: "Waste increased 14% this month.",
  confidence: 0.84,
  reasoning: "Compared waste records for current and prior windows.",
  citations: [
    {
      id: "cite_1",
      sourceType: "waste",
      title: "Monthly waste summary",
      excerpt: "Total waste up 14% MoM.",
      href: "/analytics?tab=waste",
    },
  ],
  recommendedActions: [
    {
      id: "act_1",
      label: "Explore waste analytics",
      href: "/analytics?tab=waste",
    },
  ],
};

describe("AssistantResponseCard", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders answer, confidence, and evidence", () => {
    render(<AssistantResponseCard response={mockResponse} />);

    expect(screen.getByText(/Waste increased 14%/)).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    expect(screen.getByText("Monthly waste summary")).toBeInTheDocument();
    expect(screen.getByText("Explore waste analytics")).toBeInTheDocument();
  });

  it("calls onCitationSelect when citation clicked", async () => {
    const user = userEvent.setup();
    const onCitationSelect = vi.fn();

    render(
      <AssistantResponseCard
        response={mockResponse}
        onCitationSelect={onCitationSelect}
      />,
    );

    const buttons = screen.getAllByRole("button", {
      name: "Monthly waste summary",
    });
    await user.click(buttons[0]);
    expect(onCitationSelect).toHaveBeenCalledWith("cite_1");
  });
});
