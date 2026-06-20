import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NotificationCenter } from "@/features/notifications/components/NotificationCenter";
import { resetMockNotifications } from "@/lib/api/notifications";
import { resetMockOrganizationSettings } from "@/lib/mocks/settings-fixtures";

vi.mock("@/features/organizations/hooks/useOrganizations", () => ({
  useOrganizations: () => ({
    activeOrgId: "org_demo_123",
  }),
}));

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe("NotificationCenter", () => {
  beforeEach(() => {
    resetMockNotifications();
    resetMockOrganizationSettings();
  });

  afterEach(() => {
    cleanup();
  });

  it("shows unread badge on bell", async () => {
    const { unmount } = renderWithQuery(<NotificationCenter />);

    await waitFor(() => {
      expect(screen.getByLabelText(/unread notification/i)).toBeInTheDocument();
    });

    unmount();
  });

  it("opens drawer with notifications list", async () => {
    const user = userEvent.setup();
    const { unmount } = renderWithQuery(<NotificationCenter />);

    await waitFor(() => {
      expect(screen.getByLabelText(/unread notification/i)).toBeInTheDocument();
    });

    await user.click(screen.getByLabelText(/unread notification/i));

    await waitFor(() => {
      expect(screen.getByText("Notifications")).toBeInTheDocument();
    });

    expect(screen.getByText(/Receipt upload processed/i)).toBeInTheDocument();
    unmount();
  });
});
