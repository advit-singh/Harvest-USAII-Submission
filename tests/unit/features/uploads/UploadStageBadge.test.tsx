import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { UploadStageBadge } from "@/features/uploads/components/queue/UploadStageBadge";

describe("UploadStageBadge", () => {
  it("renders review required status", () => {
    render(<UploadStageBadge status="review_required" />);
    expect(screen.getByText("Review required")).toBeInTheDocument();
  });

  it("renders completed status", () => {
    render(<UploadStageBadge status="completed" />);
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });
});
