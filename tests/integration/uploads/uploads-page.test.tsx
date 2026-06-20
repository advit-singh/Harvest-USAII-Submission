import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UploadShell } from "@/features/uploads/components/UploadShell";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("tab=upload"),
  useRouter: () => ({
    replace: vi.fn(),
  }),
}));

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const result = render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
  return { ...result, queryClient };
}

describe("UploadShell", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("shows empty org dashboard when org id is missing", () => {
    const { unmount } = renderWithQuery(<UploadShell orgId={null} />);
    expect(screen.getByText("Welcome to Project Harvest")).toBeInTheDocument();
    unmount();
  });

  it("renders upload tabs for demo org", async () => {
    const { unmount } = renderWithQuery(
      <UploadShell orgId="org_demo_123" />,
    );

    await waitFor(
      () => {
        expect(screen.getByRole("tab", { name: /Upload/i })).toBeInTheDocument();
      },
      { timeout: 5000 },
    );

    expect(screen.getByRole("tab", { name: /Processing/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /History/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Validation/i })).toBeInTheDocument();
    unmount();
  });
});
