import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Leaf } from "lucide-react";
import { EmptyState } from "@/components/feedback/EmptyState";

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(
      <EmptyState
        icon={Leaf}
        title="No data yet"
        description="Upload files to get started."
      />,
    );

    expect(screen.getByText("No data yet")).toBeInTheDocument();
    expect(screen.getByText("Upload files to get started.")).toBeInTheDocument();
  });

  it("renders action button when provided", () => {
    const onAction = vi.fn();
    render(
      <EmptyState
        title="Empty"
        description="Description"
        actionLabel="Upload"
        onAction={onAction}
      />,
    );

    screen.getByRole("button", { name: "Upload" }).click();
    expect(onAction).toHaveBeenCalledOnce();
  });
});
