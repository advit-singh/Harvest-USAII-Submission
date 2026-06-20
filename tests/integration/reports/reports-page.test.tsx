import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReportsShell } from "@/features/reports/components/ReportsShell";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("tab=templates"),
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

describe("ReportsShell", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("shows empty org dashboard when org id is missing", () => {
    const { unmount } = renderWithQuery(<ReportsShell orgId={null} />);
    expect(screen.getByText("Welcome to Project Harvest")).toBeInTheDocument();
    unmount();
  });

  it("renders report tabs for demo org", async () => {
    const { unmount } = renderWithQuery(
      <ReportsShell orgId="org_demo_123" />,
    );

    await waitFor(
      () => {
        expect(screen.getByRole("tab", { name: /Templates/i })).toBeInTheDocument();
      },
      { timeout: 5000 },
    );

    expect(screen.getByRole("tab", { name: /Generated/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Scheduled/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Exports/i })).toBeInTheDocument();
    unmount();
  });
});
