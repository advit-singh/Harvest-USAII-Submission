import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UsersSection } from "@/features/settings/components/sections/UsersSection";
import { SettingsSectionNav } from "@/features/settings/components/SettingsSectionNav";
import { resetMockOrganizationSettings } from "@/lib/mocks/settings-fixtures";
import { resetMockOrganizations } from "@/lib/api/organizations";

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe("Settings workspace", () => {
  beforeEach(() => {
    resetMockOrganizationSettings();
    resetMockOrganizations();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders users section with members table", async () => {
    const { unmount } = renderWithQuery(<UsersSection orgId="org_demo_123" />);

    await waitFor(() => {
      expect(screen.getByText("Team members")).toBeInTheDocument();
    });

    expect(screen.getByText("demo@projectharvest.app")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /invite member/i })).toBeInTheDocument();
    unmount();
  });

  it("renders section navigation", () => {
    const onSectionChange = vi.fn();
    const { unmount } = render(
      <SettingsSectionNav
        activeSection="organization"
        onSectionChange={onSectionChange}
      />,
    );

    expect(screen.getByLabelText("Settings sections")).toBeInTheDocument();
    expect(screen.getByText("Permissions")).toBeInTheDocument();
    expect(screen.getByText("Appearance")).toBeInTheDocument();
    unmount();
  });
});
