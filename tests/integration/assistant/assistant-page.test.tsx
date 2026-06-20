import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AssistantShell } from "@/features/assistant/components/AssistantShell";
import { resetMockAssistant } from "@/lib/mocks/assistant-fixtures";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("conversation=conv_demo_001"),
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

describe("AssistantShell", () => {
  beforeEach(() => {
    localStorage.clear();
    resetMockAssistant();
  });

  afterEach(() => {
    cleanup();
  });

  it("shows empty org dashboard when org has no operational data", async () => {
    const { unmount } = renderWithQuery(
      <AssistantShell orgId="org_empty_test" />,
    );

    await waitFor(() => {
      expect(screen.getByText("Welcome to Project Harvest")).toBeInTheDocument();
    });
    unmount();
  });

  it("renders chat UI with conversation history for demo org", async () => {
    const { unmount } = renderWithQuery(
      <AssistantShell orgId="org_demo_123" />,
    );

    await waitFor(
      () => {
        expect(screen.getByLabelText("Conversation history")).toBeInTheDocument();
      },
      { timeout: 5000 },
    );

    await waitFor(
      () => {
        expect(
          screen.getByLabelText("Message to AI Assistant"),
        ).toBeInTheDocument();
      },
      { timeout: 5000 },
    );

    expect(screen.getAllByText(/Why was waste higher/i).length).toBeGreaterThan(0);
    expect(screen.getByText("Suggested questions")).toBeInTheDocument();
    unmount();
  });
});
