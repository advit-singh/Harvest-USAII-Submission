import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RescueShell } from "@/features/rescue/components/RescueShell";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("tab=opportunities"),
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

describe("RescueShell", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("shows empty org dashboard when org has no operational data", async () => {
    const { unmount } = renderWithQuery(
      <RescueShell orgId="org_empty_test" />,
    );

    await waitFor(() => {
      expect(screen.getByText("Welcome to Project Harvest")).toBeInTheDocument();
    });
    unmount();
  });

  it("renders rescue tabs when operational data exists", async () => {
    const { unmount } = renderWithQuery(
      <RescueShell orgId="org_demo_123" />,
    );

    await waitFor(
      () => {
        expect(
          screen.getByRole("tab", { name: /Opportunities/i }),
        ).toBeInTheDocument();
      },
      { timeout: 5000 },
    );

    expect(screen.getByRole("tab", { name: /Recipients/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /History/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Impact/i })).toBeInTheDocument();
    unmount();
  });
});
